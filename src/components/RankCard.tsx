import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { RankInfo } from '../hooks/useRank';

const RANK_COLORS: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#A8B2C0',
  Gold: '#C89B3C',
  Platin: '#26D0CE',
  Diamond: '#5B8DD9',
  Master: '#A855F7',
  Challenger: '#FF6B35',
};

const RANK_EMOJI: Record<string, string> = {
  Bronze: '🛡️',
  Silver: '⚔️',
  Gold: '🏆',
  Platin: '💎',
  Diamond: '💠',
  Master: '🔱',
  Challenger: '👑',
};

const NEXT_RANK: Record<string, string> = {
  Bronze: 'Silver',
  Silver: 'Gold',
  Gold: 'Platin',
  Platin: 'Diamond',
  Diamond: 'Master',
  Master: 'Challenger',
};

interface RankCardProps {
  rankInfo: RankInfo;
}

export function RankCard({ rankInfo }: RankCardProps) {
  const { rank, rpState, progress } = rankInfo;
  const color = RANK_COLORS[rank.name] ?? Colors.textSecondary;
  const nextRank = NEXT_RANK[rank.name];
  const rpToNext = rank.ceil - rpState.currentRP;

  return (
    <View style={[styles.card, { borderColor: color + '50' }]}>
      {/* Symbol + Name + RP zentriert */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{RANK_EMOJI[rank.name]}</Text>
        <Text style={[styles.rankName, { color }]}>{rank.name.toUpperCase()}</Text>
        <View style={styles.rpRow}>
          <Text style={styles.rpValue}>{rpState.currentRP}</Text>
          <Text style={styles.rpLabel}> RP</Text>
        </View>
      </View>

      {/* Fortschrittsbalken */}
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: color }]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.boundLabel}>{rank.floor} RP</Text>
        {nextRank ? (
          <Text style={styles.toNextLabel}>
            noch {rpToNext} bis {nextRank}
          </Text>
        ) : (
          <Text style={[styles.toNextLabel, { color }]}>Höchster Rang</Text>
        )}
        <Text style={styles.boundLabel}>
          {rank.name === 'Challenger' ? '∞' : `${rank.ceil} RP`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  heroEmoji: {
    fontSize: 64,
    lineHeight: 76,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  rpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rpValue: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  rpLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boundLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  toNextLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
