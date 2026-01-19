import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate content using the new @google/genai SDK pattern.
 * @param {string} contents - The text prompt or content object.
 * @returns {Promise<string>} - The generated text response.
 */
async function generateContent(contents) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error("❌ [geminiAI] Error:", error?.message || error);
    throw error;
  }
}

export default generateContent;


