
import { TagData, CustomAPIConfig } from "../types";
import { DEFAULT_REVERSE_PROMPT } from "../utils/apiConfigStore";
import { ADVANCED_REVERSE_PROMPT, assembleAdvancedCaption, stripJsonFence } from "../utils/advancedCaption";

export async function autoTagImageOpenAI(
  base64Data: string,
  mimeType: string,
  config: CustomAPIConfig,
  reversePrompt = DEFAULT_REVERSE_PROMPT
): Promise<TagData> {
  // Accept either a bare API root or a trailing-slash root from user settings.
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
          content: reversePrompt
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

  // Some compatible providers wrap JSON in markdown despite the instruction to return raw JSON.
  const jsonStr = stripJsonFence(content);
  return JSON.parse(jsonStr) as TagData;
}

export async function autoTagImageOpenAIAdvanced(
  base64Data: string,
  mimeType: string,
  config: CustomAPIConfig,
  advancedPrompt = ADVANCED_REVERSE_PROMPT
): Promise<string> {
  // Accept either a bare API root or a trailing-slash root from user settings.
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
          content: advancedPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and output ONLY valid JSON in this exact shape: {"character_1":{"bbox":[x1,y1,x2,y2],"name":"$character_1$"},"image":{"tags":"<character_1>...</character_1><general_tags>...</general_tags>","caption":"Extremely detailed English description, >=200 words."}}. The image.tags string must contain XML tags. Do not use image_analysis or any alternate schema.'
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
      max_tokens: 3000,
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

  return assembleAdvancedCaption(content);
}
