# HabitRank — Claude Code Project Memory

## Projekt-Übersicht

**HabitRank** ist eine mobile Habit-Tracking-App mit einem League-of-Legends-inspirierten Rangsystem.
Aktuell: Solo-Projekt für persönlichen Gebrauch. Später eventuell für andere Nutzer.

- **Plattform:** iOS zuerst (iPhone 16 Pro), später Android + Desktop
- **Framework:** React Native + Expo (TypeScript)
- **Datenhaltung:** Lokal auf dem Gerät (AsyncStorage / SQLite) — kein Backend, kein Cloud
- **Deployment:** TestFlight (kein App Store in Phase 1)

---

## Tech Stack

| Bereich           | Technologie                                 |
| ----------------- | ------------------------------------------- |
| Sprache           | TypeScript                                  |
| Framework         | React Native + Expo SDK 54                  |
| Navigation        | Expo Router (file-based)                    |
| Gestures          | react-native-gesture-handler 2.28.0         |
| Lokale DB         | AsyncStorage → später SQLite (expo-sqlite)  |
| Styling           | StyleSheet API (kein externes UI-Framework) |
| Testing           | Jest + React Native Testing Library         |
| Linting           | ESLint + Prettier                           |
| Versionskontrolle | Git + GitHub                                |

---

## Projektstruktur

```
habitrank/
├── app/                        # Expo Router — Screens
│   ├── _layout.tsx             # ✅ Root Layout (Stack + GestureHandlerRootView)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # ✅ Tab Navigation (headerShown: false)
│   │   ├── index.tsx           # ✅ Homescreen
│   │   ├── stats.tsx           # ✅ Statistik-Screen
│   │   ├── rank.tsx            # ✅ Rang-Screen
│   │   └── settings.tsx        # ✅ Einstellungs-Screen
│   └── habit/
│       └── create.tsx          # ✅ Habit erstellen
├── src/
│   ├── components/
│   │   ├── RankCard.tsx        # ✅ Hero-Layout mit Emoji, RP, Fortschrittsbalken
│   │   └── HabitItem.tsx       # ✅ Swipe-to-delete via Swipeable
│   ├── hooks/
│   │   ├── useTodayHabits.ts   # ✅ Heute-Habits + toggle (optimistic) + archive
│   │   ├── useRank.ts          # ✅ RP + Rang + Fortschritt
│   │   └── useStats.ts         # ✅ Statistik-Daten (Streak, %, RP, Grid)
│   ├── services/
│   │   ├── habitService.ts     # ✅ Habit CRUD (createHabit, archiveHabit, getAllHabits)
│   │   ├── logService.ts       # ✅ HabitLog CRUD + getStreak + getLogsInRange
│   │   ├── rpService.ts        # ✅ RP-Berechnung, Soft/Hard-Abstieg
│   │   └── settingsService.ts  # ✅ AppSettings lesen/schreiben, Export, Reset
│   ├── types/
│   │   └── index.ts            # ✅ Habit, HabitLog, RPState, AppSettings
│   ├── constants/
│   │   ├── ranks.ts            # ✅ Rang-Grenzen + getRankForRP()
│   │   ├── theme.ts            # ✅ Colors, Spacing, Radius
│   │   └── icons.ts            # ✅ HABIT_ICON_MAP (icon-key → Ionicons-Name)
│   └── utils/
│       ├── date.ts             # ✅ getLocalDateString, getYesterday, getWeekStart
│       └── id.ts               # ✅ generateId() — Hermes-kompatibler UUID-Ersatz
├── docs/
│   ├── architecture.md
│   └── rank-system.md
├── assets/
├── CLAUDE.md
├── app.json
├── tsconfig.json
└── package.json
```

---

## Kern-Datenmodelle (TypeScript)

```typescript
// src/types/index.ts

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string; // Key aus HABIT_ICON_MAP, z.B. "run"
  frequency: HabitFrequency;
  reminderEnabled: boolean;
  reminderTime?: string; // "HH:MM"
  createdAt: string; // "YYYY-MM-DD"
  archivedAt?: string; // gesetzt wenn "gelöscht" — nie wirklich löschen!
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string; // ISO-Datum des Abhakens
  date: string; // "YYYY-MM-DD"
}

export interface RPState {
  currentRP: number;
  daysUnderFloor: number; // Für Soft-Abstieg Logik (0–3)
  lastUpdatedDate: string; // "YYYY-MM-DD"
}

export interface AppSettings {
  weekStartsOnMonday: boolean; // Standard: true
  notifyDailySummary: boolean;
  notifyDemotionWarning: boolean;
}
```

---

## Rang-System

### Ränge, RP-Grenzen und Symbole

```typescript
// src/constants/ranks.ts
export const RANKS = [
  { name: 'Bronze', floor: 0, ceil: 49 },
  { name: 'Silver', floor: 50, ceil: 149 },
  { name: 'Gold', floor: 150, ceil: 349 },
  { name: 'Platin', floor: 350, ceil: 649 },
  { name: 'Diamond', floor: 650, ceil: 999 },
  { name: 'Master', floor: 1000, ceil: 1499 },
  { name: 'Challenger', floor: 1500, ceil: 99999 },
] as const;
```

Rang-Emojis (definiert inline in RankCard + rank.tsx):
`🛡️ Bronze · ⚔️ Silver · 🏆 Gold · 💎 Platin · 💠 Diamond · 🔱 Master · 👑 Challenger`

### RP-Mechanik

| Aktion                         | RP                 |
| ------------------------------ | ------------------ |
| Habit erledigt (täglich)       | +1                 |
| Habit erledigt (wöchentlich)   | +3                 |
| Alle Habits des Tages erledigt | +5 Bonus           |
| Streak 7–29 Tage               | ×1.5 Multiplikator |
| Streak 30+ Tage                | ×2 Multiplikator   |
| Habit verpasst (täglich)       | −1                 |
| Kein einziger Habit heute      | −5                 |
| Streak gebrochen               | −3 einmalig        |

### Soft- vs. Hard-Abstieg

- **Soft:** RP sinken, Rang bleibt solange `daysUnderFloor < 3`
- **Hard:** Nach 3 aufeinanderfolgenden Tagen unter dem Rang-Boden → Abstieg um 1 Rang
- Minimum RP = 0 (nie negativ)
- Beim Abstieg landet man auf dem `floor` des neuen Rangs
- Beim Aufstieg werden überschüssige RP mitgenommen (kein Reset auf floor)

### Wochenlogik für wöchentliche Habits

- Woche = Montag bis Sonntag (konfigurierbar via `AppSettings.weekStartsOnMonday`)
- Ein wöchentliches Habit kann pro Woche genau einmal abgehakt werden
- **Noch nicht implementiert:** −2 RP am Sonntag für nicht erledigte wöchentliche Habits
- **Noch nicht implementiert:** `getWeekStart()` ignoriert aktuell noch die Einstellung — immer Montag

---

## Screen-Übersicht

### Homescreen (`app/(tabs)/index.tsx`) ✅

- Header: deutsches Datum links, Plus-Button rechts → `/habit/create`
- RankCard (Hero-Layout)
- Habit-Sektionen: "Täglich" und "Wöchentlich"
- Streak-Pill bei aktivem Streak (ab 2 Tagen)
- Swipe-to-delete pro HabitItem
- `useFocusEffect` → Reload nach Rückkehr vom Erstellen-Screen
- `calculateDailyRP(yesterday)` beim App-Start (idempotent via `lastUpdatedDate`)

### Statistik (`app/(tabs)/stats.tsx`) ✅

- 4 Stat-Karten (2×2): Aktueller Streak, Diese Woche %, Aktuelle RP, Tage aktiv
- Streak-Grid: 28 Tages-Zellen pro Habit (grün = erledigt)
- Abschlussrate-Balken pro Habit mit Prozentanzeige
- Leerzustand wenn keine Habits vorhanden

### Rang (`app/(tabs)/rank.tsx`) ✅

- Hero: 88px Emoji, Rang-Name (farbig), RP, Fortschrittsbalken
- Abstiegs-Banner: grün (sicher) / gelb (1 Tag) / rot (2 Tage, droht Abstieg)
- Rang-Liste Challenger→Bronze: Aktuell / ✓ erreicht / – gesperrt

### Habit erstellen (`app/habit/create.tsx`) ✅

- Textfeld, Frequenz-Karten, 4-spaltiges Icon-Grid (12 Icons), Erinnerungs-Toggle + Zeit
- Validierung, `createHabit()`, `router.back()`
- **Noch nicht implementiert:** Habit bearbeiten (Edit-Modus)

### Einstellungen (`app/(tabs)/settings.tsx`) ✅

- Habit-Liste: Icon, Name, Frequenz, Löschen (archivieren, mit Bestätigungs-Alert)
- Benachrichtigungen: Toggles für Zusammenfassung + Abstiegs-Warnung (gespeichert, noch nicht aktiv)
- Darstellung: Wochenstart Mo/So als Pill-Auswahl
- Daten: Export als JSON via iOS Share-Sheet, Alles zurücksetzen (mit Warnung)

---

## Wichtige Implementierungs-Regeln

### Allgemein

- **TypeScript strict mode** immer aktiviert (`"strict": true` in tsconfig.json)
- Keine `any` Types verwenden — lieber `unknown` mit Type Guard
- Funktionale Komponenten + React Hooks, keine Class Components
- Alle Texte auf **Deutsch** (App ist für deutschsprachigen Nutzer)

### Datenhaltung

- Habits **niemals wirklich löschen** — immer `archivedAt` setzen
- AsyncStorage-Keys:
  - `@habitrank/habits` — Habit[]
  - `@habitrank/logs` — HabitLog[]
  - `@habitrank/rp` — RPState
  - `@habitrank/settings` — AppSettings
- Datum immer als `"YYYY-MM-DD"` String speichern
- `getLocalDateString()` statt `.toISOString()` verwenden (UTC-Problem in deutschen Zeitzonen)
- `T12:00:00` Trick: Beim Erstellen von Date-Objekten aus YYYY-MM-DD-Strings immer Mittag anhängen, um UTC-Mitternacht-Boundary-Bugs zu vermeiden

### RP-Berechnung

- RP-Berechnung **täglich einmal** beim App-Start (für den Vortag)
- `lastUpdatedDate` prüfen um Doppel-Berechnungen zu vermeiden
- Streak-Multiplikator wird auf Ganzzahl gerundet (`Math.round`)

### Gestures

- `GestureHandlerRootView` muss in `app/_layout.tsx` die gesamte App wrappen
- `Swipeable` aus `react-native-gesture-handler` für Swipe-to-delete in HabitItem

### ID-Generierung

- `crypto.randomUUID()` ist in Hermes (React Native JS-Engine) nicht verfügbar
- Stattdessen `generateId()` aus `src/utils/id.ts` verwenden

### Styling

- Primärfarbe: `Colors.primary = '#C8CBD8'` (neutrales Hellgrau — bewusst farblos, um nicht mit Rang-Farben zu verwechseln)
- Rang-Farben und UI-Farben sind getrennt — Rang-Farben nur in RankCard und rank.tsx
- Kein externes UI-Framework; nur `StyleSheet.create()`
- Dark Mode ist aktuell hardcoded (dunkles Theme)

---

## Git-Workflow

### Branch-Strategie

```
main          — stable, läuft auf TestFlight
develop       — aktuelle Entwicklung
feature/xyz   — neue Features
fix/xyz       — Bugfixes
```

### Commit-Konventionen

```
feat: Habit-Erstellen Screen implementiert
fix: RP-Berechnung bei Wochenwechsel korrigiert
refactor: RPService in eigene Datei ausgelagert
docs: Rang-System in rank-system.md dokumentiert
chore: ESLint Konfiguration aktualisiert
```

---

## Häufige Befehle

```bash
npx expo start              # Entwicklungsserver starten
npx expo start --ios        # Direkt iOS Simulator
npx expo start --tunnel     # Für physisches Gerät via Expo Go

npx tsc --noEmit            # TypeScript prüfen ohne kompilieren
npx eslint src/             # Linting
npx jest                    # Tests ausführen

eas build --platform ios --profile preview   # TestFlight Build
```

---

## Entwicklungsphasen

- [x] Phase 0: Design und Planung abgeschlossen
- [x] Phase 1: TypeScript/React Native Grundlagen lernen + Expo Setup
- [x] Phase 2: MVP — alle Screens implementiert, Habits erstellen/abhaken, AsyncStorage
- [ ] Phase 3: Rang-System vervollständigen
  - [x] RP-Berechnung (täglich, idempotent)
  - [x] Soft/Hard-Abstieg
  - [x] Streak-Logik + Multiplikator
  - [ ] Wöchentliche Habit-Strafe (−2 RP Sonntag)
  - [ ] `getWeekStart()` auf `AppSettings.weekStartsOnMonday` reagieren lassen
  - [ ] Habit bearbeiten (Edit-Screen)
- [ ] Phase 4: Polish — Animationen, echte Benachrichtigungen, TestFlight

---

## Bekannte offene Punkte

- ~~Wann wird die tägliche RP-Berechnung ausgelöst?~~ → beim App-Start für den Vortag
- ~~Daten-Export Format?~~ → JSON via iOS Share-Sheet
- ~~Wie werden wöchentliche Habits in der Statistik visualisiert?~~ → gleich wie tägliche, aber Abschlussrate gegen max. 4 (statt 28)
- Wöchentliche Habit-Strafe (−2 RP Sonntag) noch nicht in `rpService.ts` implementiert
- `getWeekStart()` ignoriert noch `AppSettings.weekStartsOnMonday` (immer Montag)
- Benachrichtigungs-Toggles in Einstellungen gespeichert, aber keine Expo-Notifications-Logik hinterlegt
- Habit bearbeiten (Edit-Modus für bestehende Habits) noch nicht implementiert
