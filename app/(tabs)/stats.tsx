import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStats, HabitStat } from '../../src/hooks/useStats';
import { HABIT_ICON_FALLBACK, HABIT_ICON_MAP } from '../../src/constants/icons';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

// ─── Stat-Karte ──────────────────────────────────────────────────────────────

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface StatCardProps {
  icon: IoniconsName;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Streak-Grid ─────────────────────────────────────────────────────────────

const CELL_GAP = 2;

function StreakRow({ habitStat }: { habitStat: HabitStat }) {
  const iconName = HABIT_ICON_MAP[habitStat.habit.icon] ?? HABIT_ICON_FALLBACK;

  return (
    <View style={styles.gridRow}>
      <Ionicons name={iconName} size={14} color={Colors.textMuted} style={styles.gridIcon} />
      <View style={styles.gridCells}>
        {habitStat.gridData.map((done, i) => (
          <View key={i} style={[styles.cell, done && styles.cellDone]} />
        ))}
      </View>
    </View>
  );
}

// ─── Abschlussrate ───────────────────────────────────────────────────────────

function RateRow({ habitStat }: { habitStat: HabitStat }) {
  const iconName = HABIT_ICON_MAP[habitStat.habit.icon] ?? HABIT_ICON_FALLBACK;
  const pct = Math.round(habitStat.completionRate * 100);

  return (
    <View style={styles.rateRow}>
      <Ionicons name={iconName} size={16} color={Colors.textSecondary} />
      <View style={styles.rateMiddle}>
        <Text style={styles.rateName} numberOfLines={1}>
          {habitStat.habit.name}
        </Text>
        <View style={styles.rateTrack}>
          <View style={[styles.rateFill, { width: `${pct}%` }]} />
        </View>
      </View>
      <Text style={styles.ratePct}>{pct}%</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, loading } = useStats();

  if (loading || !stats) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const weekPct = Math.round(stats.weekCompletionRate * 100);

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 4 Stat-Karten */}
      <View style={styles.cardGrid}>
        <StatCard
          icon="flame-outline"
          label="Aktueller Streak"
          value={`${stats.currentStreak} Tage`}
        />
        <StatCard icon="trending-up-outline" label="Diese Woche" value={`${weekPct}%`} />
        <StatCard icon="star-outline" label="Aktuelle RP" value={String(stats.currentRP)} />
        <StatCard icon="calendar-outline" label="Tage aktiv" value={String(stats.daysActive)} />
      </View>

      {/* Streak-Grid */}
      {stats.habitStats.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Streak-Verlauf</Text>
            <Text style={styles.sectionSub}>letzte 28 Tage</Text>
          </View>
          <View style={styles.gridCard}>
            {/* Wochenmarkierungen */}
            <View style={styles.gridWeekRow}>
              <View style={styles.gridIcon} />
              {[3, 2, 1, 0].map((weeksAgo) => (
                <Text key={weeksAgo} style={styles.weekLabel}>
                  {weeksAgo === 0 ? 'Heute' : `vor ${weeksAgo}W`}
                </Text>
              ))}
            </View>

            {stats.habitStats.map((hs) => (
              <StreakRow key={hs.habit.id} habitStat={hs} />
            ))}
          </View>
        </>
      )}

      {/* Abschlussrate */}
      {stats.habitStats.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Abschlussrate</Text>
            <Text style={styles.sectionSub}>letzte 28 Tage</Text>
          </View>
          <View style={styles.rateCard}>
            {stats.habitStats.map((hs, i) => (
              <View key={hs.habit.id}>
                {i > 0 && <View style={styles.rateDivider} />}
                <RateRow habitStat={hs} />
              </View>
            ))}
          </View>
        </>
      )}

      {/* Leerzustand */}
      {stats.habitStats.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Noch keine Daten.{'\n'}Erstelle dein erstes Habit!</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    gap: Spacing.sm,
  },

  // Stat-Karten
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 4,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  // Abschnitts-Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSub: {
    color: Colors.textMuted,
    fontSize: 11,
  },

  // Streak-Grid
  gridCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  gridWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  weekLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    flex: 1,
    textAlign: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gridIcon: {
    width: 16,
  },
  gridCells: {
    flex: 1,
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 2,
    backgroundColor: Colors.surfaceElevated,
  },
  cellDone: {
    backgroundColor: Colors.success,
  },

  // Abschlussrate
  rateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rateDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  rateMiddle: {
    flex: 1,
    gap: 4,
  },
  rateName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  rateTrack: {
    height: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  rateFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  ratePct: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },

  // Leerzustand
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
