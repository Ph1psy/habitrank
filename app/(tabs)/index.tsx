import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { calculateDailyRP } from '../../src/services/rpService';
import { useRank } from '../../src/hooks/useRank';
import { useTodayHabits } from '../../src/hooks/useTodayHabits';
import { RankCard } from '../../src/components/RankCard';
import { HabitItem } from '../../src/components/HabitItem';
import { Colors, Spacing } from '../../src/constants/theme';
import { getLocalDateString, getYesterday } from '../../src/utils/date';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const today = getLocalDateString();

  const { rankInfo, loading: rankLoading, reload: reloadRank } = useRank();
  const {
    dailyItems,
    weeklyItems,
    loading: habitsLoading,
    reload: reloadHabits,
    toggle,
    archive,
  } = useTodayHabits();

  // Calculate yesterday's RP once on app start (idempotent via lastUpdatedDate check).
  useEffect(() => {
    calculateDailyRP(getYesterday(today)).then(() => reloadRank());
  }, []);

  // Reload data whenever the screen comes back into focus (e.g. after creating a habit).
  useFocusEffect(
    useCallback(() => {
      reloadHabits();
      reloadRank();
    }, [reloadHabits, reloadRank])
  );

  const loading = rankLoading || habitsLoading;

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const hasHabits = dailyItems.length > 0 || weeklyItems.length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatDate(today)}</Text>
        <Pressable
          onPress={() => router.push('/habit/create')}
          hitSlop={8}
          style={styles.addButton}
        >
          <Ionicons name="add" size={30} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Rang-Karte */}
        {rankInfo && <RankCard rankInfo={rankInfo} />}

        {/* Tägliche Habits */}
        {dailyItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Täglich</Text>
            <View style={styles.habitList}>
              {dailyItems.map((item) => (
                <HabitItem
                  key={item.habit.id}
                  habit={item.habit}
                  completed={item.completed}
                  streak={item.streak}
                  onToggle={() => toggle(item)}
                  onDelete={() => archive(item.habit.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* Wöchentliche Habits */}
        {weeklyItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Wöchentlich</Text>
            <View style={styles.habitList}>
              {weeklyItems.map((item) => (
                <HabitItem
                  key={item.habit.id}
                  habit={item.habit}
                  completed={item.completed}
                  streak={item.streak}
                  onToggle={() => toggle(item)}
                  onDelete={() => archive(item.habit.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* Leerzustand */}
        {!hasHabits && (
          <View style={styles.empty}>
            <Ionicons name="add-circle-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Noch keine Habits</Text>
            <Text style={styles.emptySubtitle}>
              Tippe auf das + oben rechts{'\n'}um dein erstes Habit zu erstellen.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    padding: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  habitList: {
    gap: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
