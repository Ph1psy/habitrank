import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppSettings } from '../types';

const SETTINGS_KEY = '@habitrank/settings';

const ALL_KEYS = ['@habitrank/habits', '@habitrank/logs', '@habitrank/rp', SETTINGS_KEY];

export const DEFAULT_SETTINGS: AppSettings = {
  weekStartsOnMonday: true,
  notifyDailySummary: false,
  notifyDemotionWarning: true,
};

export async function getSettings(): Promise<AppSettings> {
  const json = await AsyncStorage.getItem(SETTINGS_KEY);
  if (json === null) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(JSON.parse(json) as Partial<AppSettings>) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function exportData(): Promise<string> {
  const pairs = await AsyncStorage.multiGet(ALL_KEYS);
  const data: Record<string, unknown> = {};
  for (const [key, value] of pairs) {
    if (value !== null) {
      try {
        data[key] = JSON.parse(value) as unknown;
      } catch {
        data[key] = value;
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove(ALL_KEYS);
}
