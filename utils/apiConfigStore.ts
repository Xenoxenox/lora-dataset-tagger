import { CustomAPIConfig } from '../types';

const MEMOIZE_KEY = 'lora_tagger_memoize';
const API_CONFIG_KEY = 'lora_tagger_api_config';

export const DEFAULT_API_CONFIG: CustomAPIConfig = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
  model: ''
};

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
