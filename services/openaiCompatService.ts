
import { TagData, CustomAPIConfig } from "../types";

const TAGGING_SYSTEM_PROMPT = `You are a high-precision image captioning expert for Stable Diffusion LoRA training.
Analyze the image provided and extract descriptive tags.
Rules:
1. Use Danbooru-style tags (comma-separated short phrases).
2. Focus on physical characteristics, style, clothing, and environment.
3. Keep tags concise.
4. Return the data in a clean JSON format matching the schema.
5. If the image is anime-style, identify common tropes.`;

export async function autoTagImageOpenAI(
  base64Data: string,
  mimeType: string,
  config: CustomAPIConfig
): Promise<TagData> {
  const url = config.baseUrl.endsWith('/')
    ? `${config.baseUrl}chat/completions`
    : `${config.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: TAGGING_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide tags for LoRA training as JSON with these fields: character (character features, hair color, eye color), style (art style, rendering style), clothing (outfits and accessories), expression (facial expressions), action (poses and actions), position (camera angle, se), background (environment details), lighting (lighting effects), atmosphere (mood and vibes), objects (key items in scene), other (quality tags and miscellaneous). Return ONLY valid JSON.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from API");
  }

  // Extract JSON from markdown code blocks if present
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  return JSON.parse(jsonStr) as TagData;
}
