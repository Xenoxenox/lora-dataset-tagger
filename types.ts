
export interface TagData {
  character: string;
  style: string;
  clothing: string;
  expression: string;
  action: string;
  position: string;
  background: string;
  lighting: string;
  atmosphere: string;
  objects: string;
  other: string;
}

// Runtime image state keeps the mutable browser File alongside its caption fields.
export interface TaggedImage {
  id: string;
  file: File;
  previewUrl: string;
  tags: TagData;
  isAutoTagged: boolean;
  isEdited: boolean;
  isResized: boolean;
  resizeBadge: string | null;
}

export type TagField = keyof TagData;

// Defaults are part of the NewbieLoraTrainer caption contract, not just UI placeholders.
export const DEFAULT_TAGS: TagData = {
  character: "",
  style: "",
  clothing: "",
  expression: "",
  action: "",
  position: "",
  background: "",
  lighting: "",
  atmosphere: "",
  objects: "",
  other: ""
};

// Optional OpenAI-compatible endpoint used when the built-in Gemini path is not desired.
export interface CustomAPIConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
}
