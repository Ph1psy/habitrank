import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRank } from '../../src/hooks/useRank';
import { RANKS } from '../../src/constants/ranks';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

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

export default function RankScreen() {
  const insets = useSafeAreaInsets();
  const { rankInfo, loading } = useRank();

  if (loading || !rankInfo) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const { rank, rpState, progress } = rankInfo;
  const color = RANK_COLORS[rank.name] ?? Colors.textSecondary;
  const daysUnder = rpState.daysUnderFloor;

  const bannerColor =
    daysUnder === 0 ? Colors.success : daysUnder === 1 ? Colors.warning : Colors.danger;
  const bannerText =
    daysUnder === 0
      ? '✓  Rang ist sicher'
      : daysUnder === 1
        ? '⚠  Noch 2 Tage bis Abstieg'
        : '⚠  Noch 1 Tag bis Abstieg';

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Grosses Rang-Symbol */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{RANK_EMOJI[rank.name]}</Text>
        <Text style={[styles.heroName, { color }]}>{rank.name.toUpperCase()}</Text>
        <View style={styles.heroRpRow}>
          <Text style={styles.heroRpValue}>{rpState.currentRP}</Text>
          <Text style={styles.heroRpLabel}> RP</Text>
        </View>
      </View>

      {/* Fortschrittsbalken */}
      <View style={styles.progressBlock}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.round(progress * 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.boundLabel}>{rank.floor} RP</Text>
          <Text style={styles.boundLabel}>
            {rank.name === 'Challenger' ? '∞' : `${rank.ceil} RP`}
          </Text>
        </View>
      </View>

      {/* Abstiegsschutz-Banner */}
      <View
        style={[
          styles.banner,
          { backgroundColor: bannerColor + '18', borderColor: bannerColor + '50' },
        ]}
      >
        <Text style={[styles.bannerText, { color: bannerColor }]}>{bannerText}</Text>
      </View>

      {/* Alle Ränge */}
      <Text style={styles.sectionLabel}>Alle Ränge</Text>
      <View style={styles.rankList}>
        {[...RANKS].reverse().map((r) => {
          const isCurrent = r.name === rank.name;
          const isReached = r.ceil < rpState.currentRP;
          const rankColor = RANK_COLORS[r.name] ?? Colors.textMuted;

          return (
            <View
              key={r.name}
              style={[
                styles.rankRow,
                isCurrent && {
                  borderColor: rankColor + '60',
                  backgroundColor: rankColor + '12',
                },
              ]}
            >
              <Text style={styles.rankRowEmoji}>{RANK_EMOJI[r.name]}</Text>
              <View style={styles.rankRowInfo}>
                <Text
                  style={[styles.rankRowName, (isCurrent || isReached) && { color: rankColor }]}
                >
                  {r.name}
                </Text>
                <Text style={styles.rankRowRange}>
                  {r.floor} – {r.name === 'Challenger' ? '∞' : r.ceil} RP
                </Text>
              </View>
              {isCurrent ? (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: rankColor + '20', borderColor: rankColor + '50' },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: rankColor }]}>Aktuell</Text>
                </View>
              ) : isReached ? (
                <Text style={[styles.reachedCheck, { color: rankColor }]}>✓</Text>
              ) : (
                <Text style={styles.lockedDash}>–</Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  heroEmoji: {
    fontSize: 88,
    lineHeight: 104,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
  },
  heroRpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroRpValue: {
    color: Colors.textPrimary,
    fontSize: 36,
    fontWeight: '700',
  },
  heroRpLabel: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  progressBlock: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boundLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  banner: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  rankList: {
    gap: Spacing.sm,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rankRowEmoji: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },
  rankRowInfo: {
    flex: 1,
  },
  rankRowName: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  rankRowRange: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reachedCheck: {
    fontSize: 18,
    fontWeight: '700',
  },
  lockedDash: {
    color: Colors.textMuted,
    fontSize: 18,
  },
});
