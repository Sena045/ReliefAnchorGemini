import { GoogleGenAI } from "@google/genai";
import { storageService } from "./storageService";
import { HELPLINES } from "../constants";

// Lazy initialization
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Get a FREE key at https://aistudio.google.com/app/apikey and add it to your .env file as API_KEY.");
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const geminiService = {
  sendMessage: async (message: string) => {
    try {
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

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      // Check if response has text
      if (response.text) {
        return response.text;
      } else {
        console.warn("Empty response from Gemini", response);
        return "I'm listening, but I couldn't think of a response. Could you say that again?";
      }

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Propagate explicit API key errors so the UI can show the instruction
      if (error.message && (error.message.includes("API Key") || error.message.includes("API_KEY") || error.message.includes("403"))) {
        throw error;
      }
      
      // Handle network or other API errors
      throw new Error("I'm having trouble connecting to my brain. Please check your internet connection or try again later.");
    }
  }
};