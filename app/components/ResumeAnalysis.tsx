import { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Select from "./Select";
import Modal from "./Modal";
import type { SerializedDocument } from "~/types/document";

interface ResumeAnalysisProps {
  resumes: SerializedDocument[];
  jobDescriptions: SerializedDocument[];
  onUpdate?: () => void;
}

interface AnalysisResult {
  score: number;
  criteriaScores: {
    keywordMatch: number;
    formatting: number;
    skillsAlignment: number;
    experienceRelevance: number;
  };
  analysis: {
    keywordsFound: string[];
    missingKeywords: string[];
    formattingIssues: string[];
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: string[];
  summary: string;
}

interface OptimizationResult {
  optimizedContent: string;
  expectedScore: number;
  changes: string[];
  formattedDocumentId: string;
}

type ExportFormat = 'txt' | 'pdf' | 'docx';

export default function ResumeAnalysis({ resumes, jobDescriptions, onUpdate }: ResumeAnalysisProps) {
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (resumeId?: string) => {
    const idToAnalyze = resumeId || selectedResume;
    if (!idToAnalyze || !selectedJob) {
      setError("Please select both a resume and a job description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/resume-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          resumeId: idToAnalyze,
          jobDescriptionId: selectedJob,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAnalysis(data.analysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedResume || !selectedJob) {
      setError("Please select both a resume and a job description");
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      // Optimize the resume
      const optimizeResponse = await fetch("/api/resume-analysis/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          resumeId: selectedResume,
          jobDescriptionId: selectedJob,
        }),
      });

      const optimizeData = await optimizeResponse.json();

      if (!optimizeResponse.ok) {
        throw new Error(optimizeData.error || "Failed to optimize resume");
      }

      // Update state with optimization results
      setOptimization(optimizeData.optimization);
      
      // Switch to the optimized document
      const newResumeId = optimizeData.optimization.formattedDocumentId;
      setSelectedResume(newResumeId);
      onUpdate?.();

      // Analyze the optimized version
      await handleAnalyze(newResumeId);
      
      // Show the optimization modal
      setShowOptimizationModal(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to optimize resume");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!selectedResume) {
      setError("Please select a resume");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/documents/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          documentId: selectedResume,
          format,
          score: analysis?.score,
          analysis: analysis ? {
            keywordsFound: analysis.analysis.keywordsFound,
            missingKeywords: analysis.analysis.missingKeywords,
            recommendations: analysis.recommendations,
            summary: analysis.summary
          } : undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export resume");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `resume.${format}`;

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to export resume");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="bordered" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resume Analysis</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Select Resume"
            value={selectedResume}
            onChange={(e) => {
              setSelectedResume(e.target.value);
              setAnalysis(null);
            }}
            options={[
              { value: "", label: "Select a resume..." },
              ...resumes.map((resume) => ({
                value: resume.id,
                label: resume.name,
              })),
            ]}
          />
          <Select
            label="Select Job Description"
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setAnalysis(null);
            }}
            options={[
              { value: "", label: "Select a job description..." },
              ...jobDescriptions.map((job) => ({
                value: job.id,
                label: job.name,
              })),
            ]}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <Button
            onClick={() => handleAnalyze()}
            isLoading={isAnalyzing}
            disabled={!selectedResume || !selectedJob}
          >
            Analyze Resume
          </Button>
          {analysis && analysis.score < 90 && (
            <Button
              onClick={handleOptimize}
              isLoading={isOptimizing}
              variant="secondary"
              disabled={!selectedResume || !selectedJob}
            >
              Optimize Resume
            </Button>
          )}
          {selectedResume && analysis && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('txt')}
                isLoading={isExporting}
                variant="secondary"
                disabled={!selectedResume}
              >
                Export TXT
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                isLoading={isExporting}
                variant="secondary"
                disabled={!selectedResume}
              >
                Export PDF
              </Button>
              <Button
                onClick={() => handleExport('docx')}
                isLoading={isExporting}
                variant="secondary"
                disabled={!selectedResume}
              >
                Export DOCX
              </Button>
            </div>
          )}
        </div>
      </Card>

      {analysis && (
        <Card variant="bordered" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
              <div className={`text-3xl font-bold ${analysis.score >= 90 ? 'text-green-600' : 'text-blue-600'}`}>
                {analysis.score}%
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Score Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(analysis.criteriaScores).map(([key, score]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-semibold">{score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2">Keywords Found</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.analysis.keywordsFound.map((keyword, index) => (
                    <li key={index} className="text-green-600">
                      {keyword}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Missing Keywords</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.analysis.missingKeywords.map((keyword, index) => (
                    <li key={index} className="text-red-600">
                      {keyword}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Strengths</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-green-600">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Weaknesses</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-red-600">
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
          </div>
        </Card>
      )}

      {showOptimizationModal && optimization && (
        <Modal
          isOpen={showOptimizationModal}
          onClose={() => setShowOptimizationModal(false)}
          title="Optimized Resume"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expected Score</h3>
              <span className="text-2xl font-bold text-green-600">
                {optimization.expectedScore}%
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Changes Made</h3>
              <ul className="list-disc list-inside space-y-2">
                {optimization.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Optimized Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {optimization.optimizedContent}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowOptimizationModal(false)}
              >
                Close
              </Button>
              <Button onClick={() => {
                setShowOptimizationModal(false);
                handleExport('docx');
              }}>
                Export DOCX
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
