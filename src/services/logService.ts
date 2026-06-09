import AsyncStorage from '@react-native-async-storage/async-storage';

import { HabitLog } from '../types';
import { generateId } from '../utils/id';

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
    id: generateId(),
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

export async function getAllLogs(): Promise<HabitLog[]> {
  return getLogs();
}

export async function getLogsInRange(startDate: string, endDate: string): Promise<HabitLog[]> {
  const logs = await getLogs();
  return logs.filter((l) => l.date >= startDate && l.date <= endDate);
}

// Counts consecutive completed days ending on upToDate (inclusive).
export async function getStreak(habitId: string, upToDate: string): Promise<number> {
  const logs = await getLogs();
  const completedDates = new Set(logs.filter((l) => l.habitId === habitId).map((l) => l.date));

  let streak = 0;
  // Use noon to avoid UTC/local-time boundary issues when subtracting days.
  const current = new Date(upToDate + 'T12:00:00');

  while (completedDates.has(current.toISOString().split('T')[0])) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}
