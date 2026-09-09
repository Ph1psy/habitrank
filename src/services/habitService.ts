import AsyncStorage from '@react-native-async-storage/async-storage';

import { Habit, HabitFrequency } from '../types';
import { generateId } from '../utils/id';

const STORAGE_KEY = '@habitrank/habits';

async function getHabits(): Promise<Habit[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (json === null) return [];
  return JSON.parse(json) as Habit[];
}

async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export async function getAllHabits(): Promise<Habit[]> {
  const habits = await getHabits();
  return habits.filter((h) => h.archivedAt === undefined);
}

export async function getHabitById(id: string): Promise<Habit | undefined> {
  const habits = await getHabits();
  return habits.find((h) => h.id === id);
}

export async function createHabit(
  name: string,
  frequency: HabitFrequency,
  icon: string,
  reminderEnabled: boolean,
  reminderTime?: string
): Promise<Habit> {
  const habits = await getHabits();

  const newHabit: Habit = {
    id: generateId(),
    name,
    icon,
    frequency,
    reminderEnabled,
    reminderTime,
    createdAt: new Date().toISOString().split('T')[0],
  };

  await saveHabits([...habits, newHabit]);
  return newHabit;
}

export async function updateHabit(
  id: string,
  name: string,
  frequency: HabitFrequency,
  icon: string,
  reminderEnabled: boolean,
  reminderTime?: string
): Promise<void> {
  const habits = await getHabits();

  const updated = habits.map((h) =>
    h.id === id ? { ...h, name, frequency, icon, reminderEnabled, reminderTime } : h
  );

  await saveHabits(updated);
}

export async function archiveHabit(id: string): Promise<void> {
  const habits = await getHabits();

  const updated = habits.map((h) =>
    h.id === id ? { ...h, archivedAt: new Date().toISOString().split('T')[0] } : h
  );

  await saveHabits(updated);
}
