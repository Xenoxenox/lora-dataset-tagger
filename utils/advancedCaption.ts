export const ADVANCED_REVERSE_PROMPT = `Please annotate each character in the image and provide image tag information in JSON format, along with a detailed description of the scene.

[Character Identification and Annotation]
1. Create a bounding box (bbox) for each character, formatted as [bottom-left x, bottom-left y, top-right x, top-right y]
2. The bounding box should precisely contain the entire character, neither too large nor too small
3. Character names are temporarily unknown, please use placeholders like $character_1$, $character_2$, etc.

[Overall Image Analysis]
1. After analyzing the positions of all characters, provide an overall description of the image, including both tags and caption sections
2. Tags section:
- Group tags by character using structured XML format:
  <character_1><n>$character_1$</n><gender>1girl/1boy</gender><appearance>facial features, hair color, hair style, eye color, skin tone, age appearance</appearance><clothing>clothing type, color, style, accessories, footwear</clothing><body_type>height, build, physical characteristics</body_type><expression>facial expression, emotional state, mood</expression><action>current pose, movement, gesture, activity</action><interaction>interaction with other characters, objects, or environment</interaction><position>precise position in image (center, left, right, foreground, background)</position></character_1>
- Use structured XML format for general tags in <general_tags>:
  <count> overall character count (1girl, 2girls, 1boy, etc.)
  <artists> artist name / art style attribution
  <style> art style (anime style, watercolor, oil painting, digital art, realistic)
  <background> background type (indoor, outdoor, landscape, cityscape, abstract)
  <environment> specific environment (room, forest, city, beach, school, office)
  <perspective> viewpoint (from above, from below, side view, close-up, wide shot)
  <atmosphere> mood and atmosphere (dark, bright, moody, cheerful, romantic, mysterious)
  <lighting> lighting conditions (natural light, artificial light, sunset, candlelight, neon)
  <quality> image quality tags (high resolution, masterpiece, best quality, detailed)
  <objects> important objects (furniture, decorations, tools, vehicles, weapons)
  <other> any other scene-related tags not covered above
- ALWAYS include gender tags (1girl, 1boy, etc.) for each character
- Use professional prompt-word format for tags, not natural language
- All tags must be in XML format for consistency and easy parsing
- IMPORTANT: If any XML attribute is not applicable or not visible, omit that tag entirely. Only include tags relevant to what you can observe.

3. Caption section (most important):
- Use natural language to describe the entire image content in extreme detail
- Describe each character's gender, clothing, actions, poses, expressions, precise position, and relative positioning between characters
- Describe how characters interact with scene elements
- Describe background, environment, atmosphere, lighting, color tones, perspective, artistic style
- Coherent flowing narrative, not a list. At least 200 words.

[Format Requirements]
1. The JSON format must be maintained correctly
2. XML tag flexibility: omit any tags not applicable/visible
3. The caption must be extremely detailed, at least 200 words
4. Output entirely in English

[Output Format]
Output strictly according to the following JSON format, without adding any other content:
{
  "character_1": { "bbox": [x1, y1, x2, y2], "name": "$character_1$" },
  "image": {
    "tags": "<character_1>...</character_1><general_tags>...</general_tags>",
    "caption": "Extremely detailed English description, >=200 words."
  }
}`;

export const stripJsonFence = (text: string) => {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

const textValue = (value: unknown) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(v => textValue(v)).filter(Boolean).join(', ');
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, v]) => {
        const text = textValue(v);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join(', ');
  }
  return "";
};

const tag = (name: string, value: unknown) => {
  const text = textValue(value);
  return text ? `<${name}>${text}</${name}>` : "";
};

const assembleFromImageAnalysis = (analysis: unknown) => {
  if (!analysis || typeof analysis !== 'object') return "";
  const data = analysis as Record<string, unknown>;
  const metadata = data.metadata as Record<string, unknown> | undefined;
  const character = data.character_details as Record<string, unknown> | undefined;
  const setting = data.background_and_setting as Record<string, unknown> | undefined;

  const characterTags = character
    ? `<character_1>${[
        tag('appearance', [character.hair, character.eyes]),
        tag('clothing', character.outfit),
        tag('action', character.actions),
        tag('position', character.gaze),
      ].join('')}</character_1>`
    : "";

  const generalTags = `<general_tags>${[
    tag('style', metadata?.style),
    tag('atmosphere', metadata?.mood),
    tag('lighting', setting?.lighting),
    tag('background', setting?.location),
    tag('environment', setting?.surroundings),
    tag('other', metadata?.color_palette),
  ].join('')}</general_tags>`;

  const captionParts = [
    textValue(character),
    textValue(setting),
    textValue(metadata),
  ].filter(Boolean);

  if (!captionParts.length) return "";
  return `${characterTags}${generalTags}\ncaption: ${captionParts.join(' ')}`;
};

export const assembleAdvancedCaption = (rawApiText: string): string => {
  const trimmed = rawApiText.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(stripJsonFence(trimmed));
    const tags = parsed?.image?.tags;
    const caption = parsed?.image?.caption;

    if (typeof tags !== 'string' || typeof caption !== 'string') {
      const fallbackCaption = assembleFromImageAnalysis(parsed?.image_analysis);
      if (fallbackCaption) {
        return fallbackCaption;
      }
      return trimmed;
    }

    const cleanTags = tags.trim();
    const cleanCaption = caption.trim();
    if (!cleanTags || !cleanCaption) {
      return trimmed;
    }

    return `${cleanTags}\ncaption: ${cleanCaption}`;
  } catch {
    return trimmed;
  }
};
