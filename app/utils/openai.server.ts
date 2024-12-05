import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    return response;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function generateInterviewResponse(
  question: string,
  resumeContent: string,
  jobDescription: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewee responding to questions based on the following resume and job description. 
          Provide concise, professional responses that highlight relevant experience and skills from the resume.
          
          Resume:
          ${resumeContent}
          
          Job Description:
          ${jobDescription}
          
          Respond as if you are the candidate described in the resume, interviewing for this position.`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating interview response:', error);
    throw new Error('Failed to generate interview response');
  }
}

export async function processAudioChunk(chunk: Buffer): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([chunk], "chunk.wav", { type: "audio/wav" }),
      model: "whisper-1",
      language: "en",
      response_format: "text",
    });

    return response;
  } catch (error) {
    console.error('Error processing audio chunk:', error);
    throw new Error('Failed to process audio chunk');
  }
}
