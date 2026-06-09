import AsyncStorage from '@react-native-async-storage/async-storage';

import { HabitLog } from '../types';

const STORAGE_KEY = '@habitrank/logs';

async function getLogs(): Promise<HabitLog[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (json === null) return [];
  return JSON.parse(json) as HabitLog[];
}

async function saveLogs(logs: HabitLog[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  const logs = await getLogs();
  return logs.filter((log) => log.date === date);
}

export async function getLogsForHabit(habitId: string): Promise<HabitLog[]> {
  const logs = await getLogs();
  return logs.filter((log) => log.habitId === habitId);
}

export async function completeHabit(habitId: string, date: string): Promise<void> {
  const logs = await getLogs();

  const alreadyCompleted = logs.some((log) => log.habitId === habitId && log.date === date);
  if (alreadyCompleted) return;

  const newLog: HabitLog = {
    id: crypto.randomUUID(),
    habitId,
    completedAt: new Date().toISOString(),
    date,
  };

  await saveLogs([...logs, newLog]);
}

export async function uncompleteHabit(habitId: string, date: string): Promise<void> {
  const logs = await getLogs();
  const updated = logs.filter((log) => !(log.habitId === habitId && log.date === date));
  await saveLogs(updated);
}
