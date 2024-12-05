import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ResumeAnalysis {
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function analyzeResumeWithClaude(resumeContent: string, jobDescription: string): Promise<ResumeAnalysis> {
  const prompt = `You are an expert ATS (Applicant Tracking System) and resume analyzer. Analyze the following resume for the given job description and return ONLY a JSON object matching the specified interface, with no additional text or explanation.

Resume:
${resumeContent}

Job Description:
${jobDescription}

Return a JSON object matching this TypeScript interface, with realistic scores and detailed analysis:

interface ResumeAnalysis {
  score: number; // 0-100
  criteriaScores: {
    keywordMatch: number; // 0-100
    formatting: number; // 0-100
    skillsAlignment: number; // 0-100
    experienceRelevance: number; // 0-100
  };
  analysis: {
    keywordsFound: string[]; // List of important keywords found in resume
    missingKeywords: string[]; // List of important keywords from job description missing in resume
    formattingIssues: string[]; // List of formatting issues found
    strengths: string[]; // List of resume's strengths
    weaknesses: string[]; // List of resume's weaknesses
  };
  recommendations: string[]; // List of specific improvements
  summary: string; // Brief overall assessment
}

Respond ONLY with the JSON object, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4000,
    temperature: 0,
    system: "You are an expert ATS system and resume analyzer. You only respond with valid JSON matching the specified interface, with no additional text.",
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';
  
  try {
    const analysis = JSON.parse(content) as ResumeAnalysis;
    return analysis;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse resume analysis');
  }
}

export async function optimizeResumeWithClaude(resumeContent: string, jobDescription: string): Promise<{
  optimizedContent: string;
  expectedScore: number;
  changes: string[];
}> {
  const prompt = `You are an expert resume writer and ATS optimization specialist. Optimize the following resume for the given job description and return ONLY a JSON object with the specified fields, with no additional text or explanation.

Resume:
${resumeContent}

Job Description:
${jobDescription}

Return a JSON object with these fields (no additional text):
{
  "optimizedContent": string, // The complete optimized resume text
  "expectedScore": number, // Expected ATS score (0-100)
  "changes": string[] // List of specific changes made
}

Respond ONLY with the JSON object, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4000,
    temperature: 0,
    system: "You are an expert resume writer and ATS optimization specialist. You only respond with valid JSON matching the specified format, with no additional text.",
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to optimize resume');
  }
}

export async function chatWithClaude(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a helpful career advisor and job search assistant. You provide professional advice about:
- Resume writing and optimization
- Job search strategies
- Interview preparation
- Career development
- Professional networking
- Skill development recommendations

Keep responses focused on career-related topics. Be professional, encouraging, and provide actionable advice.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4000,
    temperature: 0.7,
    system: systemPrompt,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
