import AsyncStorage from '@react-native-async-storage/async-storage';

import { RANKS, getRankForRP } from '../constants/ranks';
import { RPState } from '../types';
import { getAllHabits } from './habitService';
import { getLogsForDate, getLogsForHabit } from './logService';

const STORAGE_KEY = '@habitrank/rp';
const MIN_RP = 0;

// --- Storage ---

async function getRPState(): Promise<RPState> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (json === null) {
    return { currentRP: 0, daysUnderFloor: 0, lastUpdatedDate: '' };
  }
  return JSON.parse(json) as RPState;
}

async function saveRPState(state: RPState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function getCurrentRPState(): Promise<RPState> {
  return getRPState();
}

// --- Streak ---

async function getStreakUpToDate(habitId: string, date: string): Promise<number> {
  const logs = await getLogsForHabit(habitId);
  const completedDates = new Set(logs.map((log) => log.date));

  let streak = 0;
  const current = new Date(date);

  while (completedDates.has(current.toISOString().split('T')[0])) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2;
  if (streak >= 7) return 1.5;
  return 1;
}

// --- RP Berechnung ---

export async function calculateDailyRP(date: string): Promise<void> {
  const state = await getRPState();

  if (state.lastUpdatedDate === date) return;

  const habits = await getAllHabits();
  const dailyHabits = habits.filter((h) => h.frequency === 'daily');
  const logs = await getLogsForDate(date);
  const completedIds = new Set(logs.map((log) => log.habitId));

  let rpDelta = 0;
  let allCompleted = dailyHabits.length > 0;
  let anyCompleted = false;
  let streakBroken = false;

  for (const habit of dailyHabits) {
    if (completedIds.has(habit.id)) {
      anyCompleted = true;
      const streak = await getStreakUpToDate(habit.id, date);
      const multiplier = getStreakMultiplier(streak);
      rpDelta += Math.round(1 * multiplier);
    } else {
      allCompleted = false;
      rpDelta -= 1;

      const previousStreak = await getStreakUpToDate(habit.id, getPreviousDay(date));
      if (previousStreak > 0) {
        streakBroken = true;
      }
    }
  }

  if (allCompleted) rpDelta += 5;
  if (!anyCompleted && dailyHabits.length > 0) rpDelta -= 5;
  if (streakBroken) rpDelta -= 3;

  let newRP = Math.max(MIN_RP, state.currentRP + rpDelta);

  const currentRank = getRankForRP(state.currentRP);
  let newDaysUnderFloor = newRP < currentRank.floor ? state.daysUnderFloor + 1 : 0;

  if (newDaysUnderFloor >= 3) {
    const rankIndex = RANKS.findIndex((r) => r.name === currentRank.name);
    if (rankIndex > 0) {
      newRP = RANKS[rankIndex - 1].floor;
    }
    newDaysUnderFloor = 0;
  }

  await saveRPState({
    currentRP: newRP,
    daysUnderFloor: newDaysUnderFloor,
    lastUpdatedDate: date,
  });
}

function getPreviousDay(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
