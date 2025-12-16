import { GoogleGenAI } from "@google/genai";
import { storageService } from "./storageService";
import { HELPLINES } from "../constants";

// In a real scenario, process.env.API_KEY would be populated. 
// For this deployed artifact, we handle the missing key gracefully or assume it exists.
const getApiKey = () => {
  // Try to get from environment
  const key = process.env.API_KEY;
  if (key) return key;
  
  // Return empty to allow UI to load, but API calls will fail if not set
  console.warn("Gemini API Key missing. Please set process.env.API_KEY");
  return ""; 
};

// Lazy initialization
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not found");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const geminiService = {
  sendMessage: async (message: string) => {
    const client = getClient();
    const user = storageService.getUser();
    const helpline = user.region === 'INDIA' ? HELPLINES.INDIA : HELPLINES.GLOBAL;

    const systemInstruction = `
      You are Anya, a supportive, empathetic mental health companion for the ReliefAnchor app.
      Your goal is to provide a safe space for users to express themselves.
      
      Guidelines:
      1. Be concise, warm, and non-judgmental.
      2. Do NOT diagnose or offer medical advice.
      3. Use 4-5 sentences max per response.
      4. If the user mentions self-harm, suicide, or severe distress, immediately provide this helpline: ${helpline.name} at ${helpline.number} and urge them to seek professional help.
      5. Speak in a calm, soothing tone.
    `;

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Anya is having trouble connecting right now. Please try again.");
    }
  }
};