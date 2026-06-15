import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Key passed explicitly so the env var name is unambiguous. The plugin would
// otherwise default to GEMINI_API_KEY / GOOGLE_API_KEY.
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
});

export const MODEL = googleAI.model("gemini-2.5-flash");

export const GENERATE_CONFIG = { maxOutputTokens: 600, temperature: 0.6 };
