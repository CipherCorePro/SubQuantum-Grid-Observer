
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SQKEffect, SQKEffectType } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Set process.env.API_KEY. Narrative generation will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const modelName = 'gemini-2.5-flash-preview-04-17';

function getSQKEffectPrompt(effect: SQKEffect): string {
  switch (effect.type) {
    case SQKEffectType.RESOURCE_BOOST:
      return `
        In a simulated multi-agent world, a 'SubQuantum Knot' event has just triggered a 'Resource Boost'.
        This means specific resources on the map will yield more or provide special bonuses for a short duration.
        Some resource patches are now visibly glowing with enhanced energy.
        Generate a brief, exciting narrative announcement (around 2-3 sentences) for players about this event.
        Make it sound like an in-game system announcement.
      `;
    case SQKEffectType.AGENT_SPEED_BOOST:
      const target = effect.details?.targetAgentId === "all" ? "all agents" : `Agent ${effect.details?.targetAgentId}`;
      const multiplier = effect.details?.speedMultiplier?.toFixed(1) || "significant";
      return `
        In a simulated multi-agent world, a 'SubQuantum Knot' event has just triggered an 'Agent Speed Boost'.
        ${target} will experience a x${multiplier} speed increase for a limited time, allowing for faster movement and exploration.
        Generate a brief, exciting narrative announcement (around 2-3 sentences) for players about this event.
        Make it sound like an in-game system announcement.
      `;
    case SQKEffectType.GOAL_REVEAL: // This is more conceptual for narrative
      return `
        In a simulated multi-agent world, a 'SubQuantum Knot' event has just occurred, creating a 'Goal Harmony'.
        This may subtly guide agents towards more valuable objectives or reveal hidden opportunities.
        The ambient SubQuantum energy feels particularly aligned with progress.
        Generate a brief, evocative narrative announcement (around 2-3 sentences) for players about this event.
        Make it sound like an in-game system announcement.
      `;
    default:
      return "An unknown SubQuantum event has occurred. Describe it mysteriously.";
  }
}

export const generateSQKEffectNarrative = async (effect: SQKEffect): Promise<string | null> => {
  if (!ai) {
    return "Gemini API not available. Event: " + effect.type;
  }

  const prompt = getSQKEffectPrompt(effect);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 50,
        topP: 0.9,
      }
    });
    
    const text = response.text;
    return text.trim();

  } catch (error) {
    console.error("Error generating narrative with Gemini API:", error);
    if (error instanceof Error) {
        return `Error generating narrative: ${error.message}`;
    }
    return "Error generating narrative.";
  }
};
