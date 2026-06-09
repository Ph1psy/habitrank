export interface Rank {
  name: string;
  floor: number;
  ceil: number;
}

export const RANKS: readonly Rank[] = [
  { name: 'Bronze', floor: 0, ceil: 49 },
  { name: 'Silver', floor: 50, ceil: 149 },
  { name: 'Gold', floor: 150, ceil: 349 },
  { name: 'Platin', floor: 350, ceil: 649 },
  { name: 'Diamond', floor: 650, ceil: 999 },
  { name: 'Master', floor: 1000, ceil: 1499 },
  { name: 'Challenger', floor: 1500, ceil: 99999 },
] as const;

export function getRankForRP(rp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (rp >= RANKS[i].floor) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}
