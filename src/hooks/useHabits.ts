import { useCallback, useEffect, useState } from 'react';

import { getAllHabits } from '../services/habitService';
import { Habit } from '../types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    const data = await getAllHabits();
    setHabits(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return { habits, loading, reload: loadHabits };
}
