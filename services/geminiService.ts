
import { GoogleGenAI, Type } from "@google/genai";
import { TagData } from "../types";
import { DEFAULT_REVERSE_PROMPT } from "../utils/apiConfigStore";

export async function autoTagImage(base64Data: string, mimeType: string, reversePrompt = DEFAULT_REVERSE_PROMPT): Promise<TagData> {
  // Vite injects GEMINI_API_KEY as process.env.API_KEY in vite.config.ts.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this image and provide tags for LoRA training as JSON.",
        },
      ],
    },
    config: {
      systemInstruction: reversePrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          character: { type: Type.STRING, description: "Character features, hair color, eye color" },
          style: { type: Type.STRING, description: "Art style, rendering style" },
          clothing: { type: Type.STRING, description: "Outfits and accessories" },
          expression: { type: Type.STRING, description: "Facial expressions" },
          action: { type: Type.STRING, description: "Poses and actions" },
          position: { type: Type.STRING, description: "Camera angle, shot type" },
          background: { type: Type.STRING, description: "Environment details" },
          lighting: { type: Type.STRING, description: "Lighting effects" },
          atmosphere: { type: Type.STRING, description: "Mood and vibes" },
          objects: { type: Type.STRING, description: "Key items in scene" },
          other: { type: Type.STRING, description: "Quality tags and miscellaneous" },
        },
        required: ["character", "style", "clothing", "expression", "action", "position", "background", "lighting", "atmosphere", "objects", "other"],
      },
    },
  });

  const jsonStr = response.text;
  if (!jsonStr) throw new Error("Empty response from AI");
  
  return JSON.parse(jsonStr) as TagData;
}
