import * as Notifications from 'expo-notifications';

import { Habit } from '../types';

const HABIT_REMINDER_PREFIX = 'habit-reminder-';
const DAILY_SUMMARY_ID = 'daily-summary';

// Legt fest wie Notifications sich verhalten wenn die App im Vordergrund ist.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

// Entfernt alle bisherigen Habit-Erinnerungen und plant sie für die übergebenen
// Habits neu — wird nach jedem Erstellen/Bearbeiten/Löschen eines Habits aufgerufen.
export async function rescheduleHabitReminders(habits: Habit[]): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const habitReminderIds = scheduled
    .filter((n) => n.identifier.startsWith(HABIT_REMINDER_PREFIX))
    .map((n) => n.identifier);

  await Promise.all(
    habitReminderIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );

  for (const habit of habits) {
    if (!habit.reminderEnabled || !habit.reminderTime) continue;

    const [hour, minute] = habit.reminderTime.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: `${HABIT_REMINDER_PREFIX}${habit.id}`,
      content: {
        title: 'HabitRank',
        body: `Zeit für: ${habit.name}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

// Tägliche Zusammenfassung um 21:00 Uhr — Inhalt ist statisch, da lokale
// Notifications keine dynamischen Daten zum Auslösungszeitpunkt laden können.
export async function setDailySummaryEnabled(enabled: boolean): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID);
  if (!enabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_SUMMARY_ID,
    content: {
      title: 'HabitRank',
      body: 'Hast du heute schon alle deine Habits erledigt?',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}

// Wird direkt (nicht geplant) ausgelöst, wenn der Nutzer kurz vor einem Abstieg steht.
export async function sendDemotionWarning(
  rankName: string,
  daysUntilDemotion: number
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Abstiegs-Warnung',
      body: `Noch ${daysUntilDemotion} Tag(e) unter dem ${rankName}-Rang — sonst drohst du abzusteigen!`,
    },
    trigger: null,
  });
}
