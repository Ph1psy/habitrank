export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: HabitFrequency;
  reminderEnabled: boolean;
  reminderTime?: string;
  createdAt: string;
  archivedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  date: string;
}

export interface RPState {
  currentRP: number;
  daysUnderFloor: number;
  lastUpdatedDate: string;
}
