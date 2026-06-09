import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { Habit } from '../types';
import { Colors, Radius, Spacing } from '../constants/theme';
import { HABIT_ICON_FALLBACK, HABIT_ICON_MAP } from '../constants/icons';
const DELETE_WIDTH = 80;

interface HabitItemProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onDelete?: () => void;
}

export function HabitItem({ habit, completed, streak, onToggle, onDelete }: HabitItemProps) {
  const iconName = HABIT_ICON_MAP[habit.icon] ?? HABIT_ICON_FALLBACK;
  const swipeableRef = useRef<Swipeable>(null);

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete?.();
  }

  function renderRightActions(progress: Animated.AnimatedInterpolation<number>) {
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <Animated.View style={[styles.deleteAction, { opacity }]}>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={styles.deleteText}>Löschen</Text>
        </Pressable>
      </Animated.View>
    );
  }

  const content = (
    <View style={[styles.container, completed && styles.containerDone]}>
      <View style={[styles.iconCircle, completed && styles.iconCircleDone]}>
        <Ionicons
          name={iconName}
          size={20}
          color={completed ? Colors.primary : Colors.textSecondary}
        />
      </View>
      <View style={styles.middle}>
        <Text style={[styles.name, completed && styles.nameDone]}>{habit.name}</Text>
        {streak > 1 && (
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>{streak} 🔥</Text>
          </View>
        )}
      </View>
      <Pressable onPress={onToggle} hitSlop={10} style={styles.checkButton}>
        <Ionicons
          name={completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={completed ? Colors.primary : Colors.border}
        />
      </Pressable>
    </View>
  );

  if (!onDelete) return content;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={DELETE_WIDTH / 2}
      overshootRight={false}
    >
      {content}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    width: DELETE_WIDTH,
    backgroundColor: Colors.danger,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  containerDone: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.surfaceElevated,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleDone: {
    backgroundColor: Colors.primary + '18',
  },
  middle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  nameDone: {
    color: Colors.textSecondary,
  },
  streakPill: {
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  streakText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  checkButton: {
    padding: 2,
  },
});
