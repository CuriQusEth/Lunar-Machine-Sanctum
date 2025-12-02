import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Initialize the client safely
const getClient = () => {
  if (!client && process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const generateAncientLore = async (stage: number): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "ARCHIVE CONNECTION OFFLINE. UNABLE TO DECRYPT ANCIENT DATA STREAMS.";
  }

  try {
    const prompt = `
      You are the voice of the Lunar Machine Sanctum, an ancient alien machine buried in the moon.
      The player has just activated Stage ${stage} of the machine.
      
      Generate a cryptic, atmospheric log entry (max 50 words) revealing a fragment of history about the "Architects".
      Tone: Eerie, metallic, ancient, sci-fi.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "DATA CORRUPTED.";
  } catch (error) {
    console.error("Gemini API Error", error);
    return "ERROR: NEURAL LINK INTERRUPTED.";
  }
};
