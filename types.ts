
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

export interface TaggedImage {
  id: string;
  file: File;
  previewUrl: string;
  tags: TagData;
  isAutoTagged: boolean;
  isEdited: boolean;
}

export type TagField = keyof TagData;

export const DEFAULT_TAGS: TagData = {
  character: "",
  style: "sayori style, sayori",
  clothing: "",
  expression: "",
  action: "",
  position: "",
  background: "",
  lighting: "",
  atmosphere: "",
  objects: "",
  other: "masterpiece, best quality"
};

export interface CustomAPIConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
}
