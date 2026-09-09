import { useCallback, useEffect, useState } from 'react';

import { archiveHabit, getAllHabits } from '../services/habitService';
import {
  completeHabit,
  getLogsForDate,
  getLogsInRange,
  getStreak,
  uncompleteHabit,
} from '../services/logService';
import { rescheduleHabitReminders } from '../services/notificationService';
import { getSettings } from '../services/settingsService';
import { Habit } from '../types';
import { getLocalDateString, getWeekStart, getYesterday } from '../utils/date';

export interface TodayHabitItem {
  habit: Habit;
  completed: boolean;
  streak: number;
}

export function useTodayHabits() {
  const today = getLocalDateString();

  const [dailyItems, setDailyItems] = useState<TodayHabitItem[]>([]);
  const [weeklyItems, setWeeklyItems] = useState<TodayHabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));

  const load = useCallback(async () => {
    setLoading(true);

    const settings = await getSettings();
    const currentWeekStart = getWeekStart(today, settings.weekStartsOnMonday);
    setWeekStart(currentWeekStart);

    const habits = await getAllHabits();
    const todayLogs = await getLogsForDate(today);
    const weekLogs = await getLogsInRange(currentWeekStart, today);

    const dailyDoneIds = new Set(todayLogs.map((l) => l.habitId));
    const weeklyDoneIds = new Set(
      weekLogs
        .filter((l) => habits.find((h) => h.id === l.habitId)?.frequency === 'weekly')
        .map((l) => l.habitId)
    );

    const daily = await Promise.all(
      habits
        .filter((h) => h.frequency === 'daily')
        .map(async (h) => {
          const completed = dailyDoneIds.has(h.id);
          const streak = await getStreak(h.id, completed ? today : getYesterday(today));
          return { habit: h, completed, streak };
        })
    );

    const weekly = habits
      .filter((h) => h.frequency === 'weekly')
      .map((h) => ({ habit: h, completed: weeklyDoneIds.has(h.id), streak: 0 }));

    setDailyItems(daily);
    setWeeklyItems(weekly);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  // Optimistic toggle: updates UI instantly, then persists to storage.
  async function toggle(item: TodayHabitItem) {
    const patch = (items: TodayHabitItem[]) =>
      items.map((i) => (i.habit.id === item.habit.id ? { ...i, completed: !i.completed } : i));

    if (item.habit.frequency === 'daily') {
      setDailyItems(patch);
      if (item.completed) {
        await uncompleteHabit(item.habit.id, today);
      } else {
        await completeHabit(item.habit.id, today);
      }
    } else {
      setWeeklyItems(patch);
      if (item.completed) {
        const weekLogs = await getLogsInRange(weekStart, today);
        const log = weekLogs.find((l) => l.habitId === item.habit.id);
        if (log) await uncompleteHabit(item.habit.id, log.date);
      } else {
        await completeHabit(item.habit.id, today);
      }
    }
  }

  async function archive(habitId: string) {
    await archiveHabit(habitId);
    await rescheduleHabitReminders(await getAllHabits());
    await load();
  }

  return { dailyItems, weeklyItems, loading, reload: load, toggle, archive };
}
