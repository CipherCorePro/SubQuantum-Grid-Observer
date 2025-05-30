
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

// Ensure API_KEY is available. In a real build process (Vite/CRA),
// this would be import.meta.env.VITE_API_KEY or process.env.REACT_APP_API_KEY.
// For this environment, we assume process.env.API_KEY is set.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the API_KEY environment variable.");
  // alert("Gemini API Key is not configured. Please set it up to use the generation feature.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateText = async (
  userInstruction: string,
  context: string = ""
): Promise<string> => {
  if (!ai) {
    return Promise.reject(new Error("Gemini API client is not initialized. Check API_KEY."));
  }

  let fullPromptToGemini: string;

  if (context) {
    // Enhanced prompt to prevent repetition and ensure seamless continuation
    fullPromptToGemini = `You are an expert AI story writer.
The story so far is:
---
${context}
---
Your task is to SEAMLESSLY continue this story. Directly append the next part based on the following instruction. DO NOT repeat any part of the "story so far". Start your response immediately with the new text.
Instruction: ${userInstruction}`;
  } else {
    fullPromptToGemini = `You are an expert AI story writer.
Your task is to start a new story based on the following instruction.
Instruction: ${userInstruction}`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: fullPromptToGemini,
      // config: { // Add config if needed, e.g., temperature, topK etc.
      //   temperature: 0.7
      // }
    });
    
    const text = response.text;
    if (typeof text !== 'string') {
        throw new Error("Invalid response format from Gemini API.");
    }
    return text;

  } catch (error: any) {
    console.error("Error generating text with Gemini:", error);
    let errorMessage = "Failed to generate text. ";
    if (error.message) {
        errorMessage += error.message;
    }
    // Specific error handling for common issues
    if (error.toString().includes("API key not valid")) {
        errorMessage = "The provided API key is not valid. Please check your API_KEY environment variable.";
    } else if (error.toString().includes("quota")) {
        errorMessage = "API quota exceeded. Please try again later.";
    }
    throw new Error(errorMessage);
  }
};
