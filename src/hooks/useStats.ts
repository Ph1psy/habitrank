import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getAllHabits } from '../services/habitService';
import { getAllLogs, getLogsInRange } from '../services/logService';
import { getCurrentRPState } from '../services/rpService';
import { getSettings } from '../services/settingsService';
import { HabitLog, Habit } from '../types';
import { getLocalDateString, getWeekStart } from '../utils/date';

export interface HabitStat {
  habit: Habit;
  gridData: boolean[]; // 28 Einträge, Index 0 = ältester Tag
  completionRate: number; // 0..1
}

export interface Stats {
  currentStreak: number;
  weekCompletionRate: number;
  currentRP: number;
  daysActive: number;
  habitStats: HabitStat[];
  last28Days: string[]; // YYYY-MM-DD, ältester zuerst
}

// Aktueller Streak für ein Habit: zählt von heute oder gestern rückwärts.
function computeCurrentStreak(logs: HabitLog[], habitId: string, today: string): number {
  const completedDates = new Set(logs.filter((l) => l.habitId === habitId).map((l) => l.date));

  // Wenn heute noch nicht gemacht: von gestern aus zählen (Streak noch "lebendig")
  let startDate = today;
  if (!completedDates.has(today)) {
    const d = new Date(today + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    startDate = getLocalDateString(d);
    if (!completedDates.has(startDate)) return 0;
  }

  let streak = 0;
  const cursor = new Date(startDate + 'T12:00:00');
  while (completedDates.has(getLocalDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const today = getLocalDateString();

    // Letzten 28 Tage (ältester zuerst)
    const last28Days = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today + 'T12:00:00');
      d.setDate(d.getDate() - (27 - i));
      return getLocalDateString(d);
    });

    const [habits, allLogs, recentLogs, rpState, settings] = await Promise.all([
      getAllHabits(),
      getAllLogs(),
      getLogsInRange(last28Days[0], today),
      getCurrentRPState(),
      getSettings(),
    ]);

    const weekStart = getWeekStart(today, settings.weekStartsOnMonday);

    // Bester aktueller Streak (höchster aktiver Streak unter allen Habits)
    const currentStreak = habits.reduce((max, h) => {
      return Math.max(max, computeCurrentStreak(allLogs, h.id, today));
    }, 0);

    // Diese Woche: welcher Anteil der Habits wurde mind. 1x abgehakt?
    const weekLogs = recentLogs.filter((l) => l.date >= weekStart);
    const weekCompletedIds = new Set(weekLogs.map((l) => l.habitId));
    const weekCompletionRate = habits.length > 0 ? weekCompletedIds.size / habits.length : 0;

    // Tage aktiv (alle Zeit, distinct)
    const daysActive = new Set(allLogs.map((l) => l.date)).size;

    // Pro-Habit: Grid + Abschlussrate
    const habitStats: HabitStat[] = habits.map((habit) => {
      const gridData = last28Days.map((date) =>
        recentLogs.some((l) => l.habitId === habit.id && l.date === date)
      );
      const completedDays = gridData.filter(Boolean).length;
      // Wöchentliche Habits: max. 4 Abschlüsse in 28 Tagen
      const denominator = habit.frequency === 'weekly' ? 4 : 28;
      const completionRate = Math.min(1, completedDays / denominator);

      return { habit, gridData, completionRate };
    });

    setStats({
      currentStreak,
      weekCompletionRate,
      currentRP: rpState.currentRP,
      daysActive,
      habitStats,
      last28Days,
    });
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { stats, loading };
}
