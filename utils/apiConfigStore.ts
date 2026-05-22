import { CustomAPIConfig } from '../types';

const MEMOIZE_KEY = 'lora_tagger_memoize';
const API_CONFIG_KEY = 'lora_tagger_api_config';
const REVERSE_PROMPT_KEY = 'lora_tagger_reverse_prompt';

export const DEFAULT_API_CONFIG: CustomAPIConfig = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
  model: ''
};

export const DEFAULT_REVERSE_PROMPT = `You are a high-precision image captioning expert for Stable Diffusion LoRA training.
Analyze the image provided and extract descriptive tags.
Rules:
1. Use Danbooru-style tags (comma-separated short phrases).
2. Focus on physical characteristics, style, clothing, and environment.
3. Keep tags concise.
4. Return the data in a clean JSON format matching the schema.
5. If the image is anime-style, identify common tropes.`;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (key: string) => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(key);
};

const writeStorage = (key: string, value: string) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, value);
};

const removeStorage = (key: string) => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
};

export const loadMemoizeConfig = () => {
  const saved = readStorage(MEMOIZE_KEY);
  return saved === null ? true : saved === 'true';
};

export const saveMemoizeConfig = (value: boolean) => {
  writeStorage(MEMOIZE_KEY, String(value));
};

export const loadApiConfig = () => {
  if (!loadMemoizeConfig()) {
    return { ...DEFAULT_API_CONFIG };
  }

  const saved = readStorage(API_CONFIG_KEY);
  if (!saved) {
    return { ...DEFAULT_API_CONFIG };
  }

  try {
    const parsed = JSON.parse(saved) as Partial<CustomAPIConfig>;
    return {
      ...DEFAULT_API_CONFIG,
      ...parsed
    };
  } catch {
    return { ...DEFAULT_API_CONFIG };
  }
};

export const saveApiConfig = (config: CustomAPIConfig, memoize = true) => {
  if (!memoize) {
    clearApiConfig();
    return;
  }

  writeStorage(API_CONFIG_KEY, JSON.stringify(config));
};

export const clearApiConfig = () => {
  removeStorage(API_CONFIG_KEY);
};

export const loadReversePrompt = () => {
  const saved = readStorage(REVERSE_PROMPT_KEY);
  return saved === null ? DEFAULT_REVERSE_PROMPT : saved;
};

export const saveReversePrompt = (prompt: string) => {
  writeStorage(REVERSE_PROMPT_KEY, prompt);
};

export const clearReversePrompt = () => {
  removeStorage(REVERSE_PROMPT_KEY);
};
