import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  createHabit,
  getAllHabits,
  getHabitById,
  updateHabit,
} from '../../src/services/habitService';
import { rescheduleHabitReminders } from '../../src/services/notificationService';
import { HabitFrequency } from '../../src/types';
import { Colors, Radius, Spacing } from '../../src/constants/theme';

// Typ für Ionicons-Namen, damit kein 'any' nötig ist
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: { name: string; ionicon: IoniconsName }[] = [
  { name: 'run', ionicon: 'walk-outline' },
  { name: 'water', ionicon: 'water-outline' },
  { name: 'book', ionicon: 'book-outline' },
  { name: 'meditation', ionicon: 'leaf-outline' },
  { name: 'gym', ionicon: 'barbell-outline' },
  { name: 'sleep', ionicon: 'moon-outline' },
  { name: 'food', ionicon: 'fast-food-outline' },
  { name: 'code', ionicon: 'code-slash-outline' },
  { name: 'music', ionicon: 'musical-notes-outline' },
  { name: 'journal', ionicon: 'pencil-outline' },
  { name: 'health', ionicon: 'heart-outline' },
  { name: 'study', ionicon: 'school-outline' },
];

// Größe einer Icon-Zelle: 4 Spalten, Padding und Abstände berücksichtigt
const SCREEN_WIDTH = Dimensions.get('window').width;
const ICON_CELL_SIZE = Math.floor((SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 3) / 4);

export default function CreateHabitScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = id !== undefined;

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].name);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [saving, setSaving] = useState(false);
  const [loadingHabit, setLoadingHabit] = useState(isEditMode);

  // Im Edit-Modus: bestehendes Habit laden und Formular vorausfüllen.
  useEffect(() => {
    if (!id) return;
    getHabitById(id).then((habit) => {
      if (habit) {
        setName(habit.name);
        setFrequency(habit.frequency);
        setSelectedIcon(habit.icon);
        setReminderEnabled(habit.reminderEnabled);
        setReminderTime(habit.reminderTime ?? '20:00');
      }
      setLoadingHabit(false);
    });
  }, [id]);

  async function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      Alert.alert('Fehler', 'Bitte gib einen Namen für das Habit ein.');
      return;
    }

    if (reminderEnabled && !/^\d{2}:\d{2}$/.test(reminderTime)) {
      Alert.alert('Fehler', 'Bitte gib eine gültige Uhrzeit ein (Format: HH:MM).');
      return;
    }

    setSaving(true);
    const finalReminderTime = reminderEnabled ? reminderTime : undefined;

    if (isEditMode && id) {
      await updateHabit(
        id,
        trimmedName,
        frequency,
        selectedIcon,
        reminderEnabled,
        finalReminderTime
      );
    } else {
      await createHabit(trimmedName, frequency, selectedIcon, reminderEnabled, finalReminderTime);
    }

    await rescheduleHabitReminders(await getAllHabits());

    setSaving(false);
    router.back();
  }

  if (loadingHabit) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.headerIconButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Habit bearbeiten' : 'Habit erstellen'}
        </Text>
        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? '...' : 'Speichern'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Text style={styles.sectionLabel}>Name</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="z.B. Täglich laufen"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={50}
          returnKeyType="done"
        />

        {/* Frequenz */}
        <Text style={styles.sectionLabel}>Häufigkeit</Text>
        <View style={styles.frequencyRow}>
          <Pressable
            style={[styles.frequencyCard, frequency === 'daily' && styles.frequencyCardActive]}
            onPress={() => setFrequency('daily')}
          >
            <Ionicons
              name="today-outline"
              size={24}
              color={frequency === 'daily' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[styles.frequencyTitle, frequency === 'daily' && styles.frequencyTitleActive]}
            >
              Täglich
            </Text>
            <Text style={styles.frequencyDesc}>Jeden Tag</Text>
          </Pressable>

          <Pressable
            style={[styles.frequencyCard, frequency === 'weekly' && styles.frequencyCardActive]}
            onPress={() => setFrequency('weekly')}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={frequency === 'weekly' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[styles.frequencyTitle, frequency === 'weekly' && styles.frequencyTitleActive]}
            >
              Wöchentlich
            </Text>
            <Text style={styles.frequencyDesc}>Einmal pro Woche</Text>
          </Pressable>
        </View>

        {/* Icon-Auswahl */}
        <Text style={styles.sectionLabel}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <Pressable
              key={icon.name}
              style={[
                styles.iconCell,
                selectedIcon === icon.name && styles.iconCellActive,
                { width: ICON_CELL_SIZE, height: ICON_CELL_SIZE },
              ]}
              onPress={() => setSelectedIcon(icon.name)}
            >
              <Ionicons
                name={icon.ionicon}
                size={26}
                color={selectedIcon === icon.name ? Colors.primary : Colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>

        {/* Erinnerung */}
        <Text style={styles.sectionLabel}>Erinnerung</Text>
        <View style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>Täglich erinnern</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.textPrimary}
            />
          </View>

          {reminderEnabled && (
            <View style={styles.timeRow}>
              <Text style={styles.reminderLabel}>Uhrzeit</Text>
              <TextInput
                style={styles.timeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="HH:MM"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIconButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.primaryDark,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
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
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  frequencyCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  frequencyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  frequencyTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  frequencyTitleActive: {
    color: Colors.primary,
  },
  frequencyDesc: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconCell: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCellActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  reminderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  reminderLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timeInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    color: Colors.textPrimary,
    fontSize: 15,
    minWidth: 70,
    textAlign: 'center',
  },
});
