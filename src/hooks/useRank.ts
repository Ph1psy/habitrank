import { useCallback, useEffect, useState } from 'react';

import { getRankForRP, Rank } from '../constants/ranks';
import { getCurrentRPState } from '../services/rpService';
import { RPState } from '../types';

export interface RankInfo {
  rank: Rank;
  rpState: RPState;
  progress: number; // 0..1 within the current rank's RP range
}

export function useRank() {
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const rpState = await getCurrentRPState();
    const rank = getRankForRP(rpState.currentRP);

    const range = rank.ceil - rank.floor;
    const progress =
      rank.name === 'Challenger'
        ? 1
        : Math.min(1, Math.max(0, (rpState.currentRP - rank.floor) / range));

    setRankInfo({ rank, rpState, progress });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rankInfo, loading, reload: load };
}
