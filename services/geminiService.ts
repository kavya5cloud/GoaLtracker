
import { GoogleGenAI, Type } from "@google/genai";
import { MENTOR_SYSTEM_INSTRUCTION, STUDY_PLAN_PROMPT } from '../constants';
import { QuizQuestion, Flashcard } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getDailyQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a deep, philosophical, and powerful 1-sentence motivation quote for a UPSC aspirant who needs to build resilience and character.",
    });
    return response.text || "Character is destiny; forge yours in the fire of discipline.";
  } catch (error) {
    console.error("Quote error", error);
    return "Consistency is the key to UPSC success.";
  }
};

export const getTopicSummary = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a concise, high-impact 2-sentence summary of the UPSC topic: "${topic}". Focus on the core definition and its significance for the exam.`,
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Summary error", error);
    return "";
  }
};

export const generateTopicContent = async (topicTitle: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for deep insights
      contents: `${STUDY_PLAN_PROMPT} ${topicTitle}`,
      config: {
        systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Content generation error", error);
    return "Error generating study material. Please check your internet connection.";
  }
};

export const generateQuizForTopic = async (topicTitle: string): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for complex logic
      contents: `Generate 5 high-level conceptual multiple choice questions for UPSC Prelims on: "${topicTitle}". 
      Focus on "Statement based" questions (e.g., Which of the statements given above is/are correct?).
      Test deep conceptual understanding, causal links, and exceptions. Do not ask simple factual questions.
      Difficulty: Hard.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "explanation"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz generation error", error);
    return [];
  }
};

export const generateFlashcards = async (topicTitle: string): Promise<Flashcard[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for better synthesis
      contents: `Generate 8 deep-revision flashcards for the UPSC topic: "${topicTitle}".
      Focus on core concepts, judicial interpretations, committees, and analytical keywords.
      The 'term' should be the Concept/Case/Committee, and 'definition' should be its significance or core ruling.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING }
            },
            required: ["term", "definition"]
          }
        }
      }
    });
    
    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as Flashcard[];
  } catch (error) {
    console.error("Flashcard generation error", error);
    return [];
  }
};

export const createMentorChat = () => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview', // Pro model for intelligent conversation
    config: {
      systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
    }
  });
};
