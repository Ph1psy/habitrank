# Architecture

## Übersicht

HabitRank ist eine lokal-first mobile App ohne Backend. Alle Daten liegen auf dem Gerät.

## Tech-Entscheidungen

### React Native + Expo

- Expo Router für file-based Navigation
- Kein externes UI-Framework — reines `StyleSheet.create()`

### Datenhaltung

- **Phase 1–2:** `AsyncStorage` unter klar benannten Keys (`@habitrank/...`)
- **Phase 3+:** Migration zu `expo-sqlite` für komplexere Abfragen geplant

### Zustandsverwaltung

- Lokaler State via React Hooks
- Custom Hooks (`useHabits`, `useRank`) kapseln Datenzugriff
- Kein globaler State-Manager (kein Redux / Zustand) in Phase 1

## Datenschicht

```
Storage (AsyncStorage)
  └── habitService.ts   — Habit CRUD
  └── rpService.ts      — RP-Berechnung, Auf-/Abstieg
  └── storage.ts        — generischer AsyncStorage Wrapper
```

## Offene Entscheidungen

- Tägliche RP-Berechnung: App-Start vs. Mitternacht via Background Task
- Daten-Export: JSON oder CSV
