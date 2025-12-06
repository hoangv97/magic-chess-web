
import { GameSettings } from '../types';

export const STORAGE_KEYS = {
  SETTINGS: 'cce_settings',
  CAMPAIGN: 'cce_campaign_save',
};

export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to ${key}`, e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (e) {
    console.error(`Failed to load from ${key}`, e);
  }
  return defaultValue;
};

export const clearFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to clear ${key}`, e);
  }
};

export const hasSavedGame = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
};
