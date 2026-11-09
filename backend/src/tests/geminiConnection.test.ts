import { GoogleGenAI } from "@google/genai";

import { env } from "../infrastructure/config/env.js";

async function testGeminiConnection() {
  const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: "Reply with exactly: JanAI Gemini connection successful.",
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    console.log("Gemini API connection successful.");
    console.log("Model:", env.GEMINI_MODEL);
    console.log("Response:", responseText);
  } catch (error) {
    console.error("Gemini API connection failed.");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

await testGeminiConnection();