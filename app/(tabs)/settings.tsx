import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Habit, AppSettings } from '../../src/types';
import { getAllHabits, archiveHabit } from '../../src/services/habitService';
import {
  getSettings,
  saveSettings,
  exportData,
  resetAllData,
  DEFAULT_SETTINGS,
} from '../../src/services/settingsService';
import { HABIT_ICON_FALLBACK, HABIT_ICON_MAP } from '../../src/constants/icons';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

// ─── Kleine Hilfskomponenten ──────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function SettingsRow({
  label,
  right,
  onPress,
  danger = false,
}: {
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const inner = (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {right}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const loadAll = useCallback(async () => {
    const [h, s] = await Promise.all([getAllHabits(), getSettings()]);
    setHabits(h);
    setSettings(s);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAll();
    }, [loadAll])
  );

  async function handleArchive(id: string) {
    Alert.alert('Habit löschen', 'Habit wirklich entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await archiveHabit(id);
          setHabits((prev) => prev.filter((h) => h.id !== id));
        },
      },
    ]);
  }

  async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  }

  async function handleExport() {
    try {
      const json = await exportData();
      await Share.share({ message: json, title: 'HabitRank Export' });
    } catch {
      Alert.alert('Fehler', 'Export fehlgeschlagen.');
    }
  }

  function handleReset() {
    Alert.alert(
      'Alles zurücksetzen',
      'Alle Habits, Logs und RP werden unwiderruflich gelöscht. Fortfahren?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            setHabits([]);
            setSettings(DEFAULT_SETTINGS);
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Einstellungen</Text>

      {/* ── Meine Habits ── */}
      <SectionHeader title="Meine Habits" />
      <Card>
        {habits.length === 0 && (
          <View style={styles.row}>
            <Text style={styles.emptyText}>Keine Habits vorhanden.</Text>
          </View>
        )}
        {habits.map((habit, i) => {
          const iconName = HABIT_ICON_MAP[habit.icon] ?? HABIT_ICON_FALLBACK;
          return (
            <View key={habit.id}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <View style={styles.habitIconCircle}>
                  <Ionicons name={iconName} size={16} color={Colors.textSecondary} />
                </View>
                <View style={styles.habitNameWrap}>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <Text style={styles.habitFreq}>
                    {habit.frequency === 'daily' ? 'Täglich' : 'Wöchentlich'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleArchive(habit.id)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.trashButton, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </Card>

      {/* ── Benachrichtigungen ── */}
      <SectionHeader title="Benachrichtigungen" />
      <Card>
        <SettingsRow
          label="Tägliche Zusammenfassung"
          right={
            <Switch
              value={settings.notifyDailySummary}
              onValueChange={(v) => updateSetting('notifyDailySummary', v)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="white"
            />
          }
        />
        <Divider />
        <SettingsRow
          label="Abstiegs-Warnung"
          right={
            <Switch
              value={settings.notifyDemotionWarning}
              onValueChange={(v) => updateSetting('notifyDemotionWarning', v)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="white"
            />
          }
        />
      </Card>

      {/* ── Darstellung ── */}
      <SectionHeader title="Darstellung" />
      <Card>
        <SettingsRow
          label="Wochenstart"
          right={
            <View style={styles.pillGroup}>
              <Pressable
                onPress={() => updateSetting('weekStartsOnMonday', true)}
                style={[styles.pill, settings.weekStartsOnMonday && styles.pillActive]}
              >
                <Text
                  style={[styles.pillText, settings.weekStartsOnMonday && styles.pillTextActive]}
                >
                  Mo
                </Text>
              </Pressable>
              <Pressable
                onPress={() => updateSetting('weekStartsOnMonday', false)}
                style={[styles.pill, !settings.weekStartsOnMonday && styles.pillActive]}
              >
                <Text
                  style={[styles.pillText, !settings.weekStartsOnMonday && styles.pillTextActive]}
                >
                  So
                </Text>
              </Pressable>
            </View>
          }
        />
      </Card>

      {/* ── Daten ── */}
      <SectionHeader title="Daten" />
      <Card>
        <SettingsRow
          label="Daten exportieren"
          onPress={handleExport}
          right={<Ionicons name="share-outline" size={18} color={Colors.textSecondary} />}
        />
        <Divider />
        <SettingsRow
          label="Alles zurücksetzen"
          onPress={handleReset}
          danger
          right={<Ionicons name="warning-outline" size={18} color={Colors.danger} />}
        />
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: Spacing.md,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  rowLabel: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  rowLabelDanger: {
    color: Colors.danger,
  },
  pressed: {
    opacity: 0.6,
  },

  // Habit-Zeile
  habitIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitNameWrap: {
    flex: 1,
    gap: 1,
  },
  habitFreq: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  trashButton: {
    padding: 4,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },

  // Wochenstart-Pills
  pillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.background,
  },
});
