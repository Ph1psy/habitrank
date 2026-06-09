import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export const HABIT_ICON_MAP: Record<string, IoniconsName> = {
  run: 'walk-outline',
  water: 'water-outline',
  book: 'book-outline',
  meditation: 'leaf-outline',
  gym: 'barbell-outline',
  sleep: 'moon-outline',
  food: 'fast-food-outline',
  code: 'code-slash-outline',
  music: 'musical-notes-outline',
  journal: 'pencil-outline',
  health: 'heart-outline',
  study: 'school-outline',
};

export const HABIT_ICON_FALLBACK: IoniconsName = 'star-outline';
