import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getDocument } from "~/models/document.server";
import { verifyToken } from "~/models/user.server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import PDFDocument from "pdfkit";

type ExportFormat = 'txt' | 'pdf' | 'docx';

interface AnalysisSummary {
  keywordsFound: string[];
  missingKeywords: string[];
  recommendations: string[];
  summary: string;
}

function formatAnalysisSummary(analysis: AnalysisSummary | undefined, score: number | undefined): string {
  if (!analysis) return '';

  return `
=== RESUME ANALYSIS SUMMARY ===
Overall Score: ${score !== undefined ? `${score}%` : 'N/A'}

Keywords Found:
${analysis.keywordsFound.map(k => `• ${k}`).join('\n')}

Missing Keywords:
${analysis.missingKeywords.map(k => `• ${k}`).join('\n')}

Recommendations:
${analysis.recommendations.map(r => `• ${r}`).join('\n')}

Summary:
${analysis.summary}

============================
`;
}

async function generateDocx(content: string, analysis?: AnalysisSummary, score?: number): Promise<Buffer> {
  const children = [];

  // Add analysis summary if available
  if (analysis) {
    children.push(
      new Paragraph({
        text: "RESUME ANALYSIS SUMMARY",
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Overall Score: ${score !== undefined ? `${score}%` : 'N/A'}`,
            bold: true,
            size: 24,
          })
        ]
      }),
      new Paragraph({
        text: "Keywords Found:",
        heading: HeadingLevel.HEADING_2,
      }),
      ...analysis.keywordsFound.map(keyword => 
        new Paragraph({
          children: [
            new TextRun({ text: "• ", size: 24 }),
            new TextRun({ text: keyword, size: 24 })
          ]
        })
      ),
      new Paragraph({
        text: "Missing Keywords:",
        heading: HeadingLevel.HEADING_2,
      }),
      ...analysis.missingKeywords.map(keyword => 
        new Paragraph({
          children: [
            new TextRun({ text: "• ", size: 24 }),
            new TextRun({ text: keyword, size: 24 })
          ]
        })
      ),
      new Paragraph({
        text: "Recommendations:",
        heading: HeadingLevel.HEADING_2,
      }),
      ...analysis.recommendations.map(rec => 
        new Paragraph({
          children: [
            new TextRun({ text: "• ", size: 24 }),
            new TextRun({ text: rec, size: 24 })
          ]
        })
      ),
      new Paragraph({
        text: "Summary:",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: analysis.summary,
            size: 24,
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "\n============================\n\n",
            size: 24,
          })
        ]
      }),
    );
  }

  // Add resume content
  children.push(
    ...content.split('\n').map(line => 
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 24, // 12pt
          })
        ]
      })
    )
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  return await Packer.toBuffer(doc);
}

async function generatePdf(content: string, analysis?: AnalysisSummary, score?: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Add analysis summary if available
    if (analysis) {
      doc.fontSize(16).text('RESUME ANALYSIS SUMMARY');
      doc.fontSize(12).text(`Overall Score: ${score !== undefined ? `${score}%` : 'N/A'}`);
      
      doc.moveDown().fontSize(14).text('Keywords Found:');
      analysis.keywordsFound.forEach(keyword => {
        doc.fontSize(12).text(`• ${keyword}`);
      });

      doc.moveDown().fontSize(14).text('Missing Keywords:');
      analysis.missingKeywords.forEach(keyword => {
        doc.fontSize(12).text(`• ${keyword}`);
      });

      doc.moveDown().fontSize(14).text('Recommendations:');
      analysis.recommendations.forEach(rec => {
        doc.fontSize(12).text(`• ${rec}`);
      });

      doc.moveDown().fontSize(14).text('Summary:');
      doc.fontSize(12).text(analysis.summary);

      doc.moveDown().text('============================').moveDown();
    }

    // Add resume content
    doc.fontSize(12);
    content.split('\n').forEach(line => {
      doc.text(line.trim());
      if (line.trim() === '') {
        doc.moveDown();
      }
    });

    doc.end();
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.auth_token;

  if (!token) {
    return json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      return json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const { documentId, format, score, analysis } = await request.json();

    if (!documentId || !format) {
      return json(
        { error: "Document ID and format are required" },
        { status: 400 }
      );
    }

    if (!['txt', 'pdf', 'docx'].includes(format)) {
      return json(
        { error: "Invalid format. Supported formats: txt, pdf, docx" },
        { status: 400 }
      );
    }

    // Get document
    const document = await getDocument(documentId, user.id);

    if (!document) {
      return json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    let fileContent: Buffer | string;
    let contentType: string;
    let fileName: string;
    const scoreText = score ? `_${Math.round(score)}%` : '';

    switch (format as ExportFormat) {
      case 'txt':
        fileContent = analysis 
          ? formatAnalysisSummary(analysis, score) + document.content
          : document.content;
        contentType = 'text/plain';
        fileName = `${document.name}${scoreText}.txt`;
        break;

      case 'pdf':
        fileContent = await generatePdf(document.content, analysis, score);
        contentType = 'application/pdf';
        fileName = `${document.name}${scoreText}.pdf`;
        break;

      case 'docx':
        fileContent = await generateDocx(document.content, analysis, score);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileName = `${document.name}${scoreText}.docx`;
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return new Response(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting document:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to export document" },
      { status: 500 }
    );
  }
}
