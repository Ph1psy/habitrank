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

| Bereich           | Technologie                                          |
| ----------------- | ---------------------------------------------------- |
| Sprache           | TypeScript                                           |
| Framework         | React Native + Expo                                  |
| Navigation        | Expo Router (file-based)                             |
| Lokale DB         | AsyncStorage (einfach) → später SQLite (expo-sqlite) |
| Styling           | StyleSheet API (kein externes UI-Framework)          |
| Testing           | Jest + React Native Testing Library                  |
| Linting           | ESLint + Prettier                                    |
| Versionskontrolle | Git + GitHub                                         |

---

## Projektstruktur

```
habitrank/
├── app/                        # Expo Router — Screens
│   ├── (tabs)/
│   │   ├── index.tsx           # Homescreen (Habits + Rang)
│   │   ├── stats.tsx           # Statistik-Screen
│   │   ├── rank.tsx            # Rang-Screen
│   │   └── settings.tsx        # Einstellungs-Screen
│   └── habit/
│       └── create.tsx          # Habit erstellen/bearbeiten
├── src/
│   ├── components/             # Wiederverwendbare UI-Komponenten
│   │   ├── RankCard.tsx        # Rang + RP Fortschrittsanzeige
│   │   ├── HabitItem.tsx       # Einzelner Habit in der Liste
│   │   ├── StreakGrid.tsx      # 28-Tage Streak Kalender
│   │   └── ProgressBar.tsx     # Generische Fortschrittsleiste
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useHabits.ts        # Habit-Daten lesen/schreiben
│   │   └── useRank.ts          # RP + Rang berechnen
│   ├── services/               # Datenzugriff / Business Logic
│   │   ├── storage.ts          # AsyncStorage Wrapper
│   │   ├── habitService.ts     # Habit CRUD
│   │   └── rpService.ts        # RP-Berechnung, Auf-/Abstieg
│   ├── types/                  # TypeScript Typdefinitionen
│   │   └── index.ts
│   └── constants/              # Feste Werte (Rang-Grenzen etc.)
│       └── ranks.ts
├── docs/                       # Projektdokumentation
│   ├── architecture.md         # Technische Entscheidungen
│   ├── design.md               # Screen-Designs (Mockups)
│   └── rank-system.md          # Rang- und RP-Logik
├── assets/                     # Icons, Bilder
├── CLAUDE.md                   # Diese Datei
├── app.json                    # Expo Konfiguration
├── tsconfig.json
└── package.json
```

---

## Kern-Datenmodelle (TypeScript)

```typescript
// src/types/index.ts

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string; // UUID
  name: string;
  icon: string; // Tabler Icon Name, z.B. "run"
  frequency: HabitFrequency;
  reminderEnabled: boolean;
  reminderTime?: string; // "HH:MM" Format, z.B. "20:00"
  createdAt: string; // ISO-Datum
  archivedAt?: string; // gesetzt wenn "gelöscht" — nie wirklich löschen!
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string; // ISO-Datum des Abhakens
  date: string; // "YYYY-MM-DD" — der Tag für den es zählt
}

export interface RPState {
  currentRP: number;
  daysUnderFloor: number; // Für Soft-Abstieg Logik (0–3)
  lastUpdatedDate: string; // "YYYY-MM-DD"
}
```

---

## Rang-System

### Ränge und RP-Grenzen

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
- Nach einem Abstieg: 1 Tag Schutz (kein weiterer Abstieg möglich)
- Minimum RP = 0 (nie negativ)
- Beim Abstieg landet man auf dem `floor` des neuen Rangs

### Wochenlogik für wöchentliche Habits

- Woche = Montag bis Sonntag (konfigurierbar in Einstellungen)
- Ein wöchentliches Habit kann pro Woche genau einmal abgehakt werden
- Nicht erledigte wöchentliche Habits am Sonntag um 23:59 → −2 RP

---

## Screen-Übersicht

### Homescreen (`app/(tabs)/index.tsx`)

- Datum oben links, Plus-Button oben rechts
- RankCard: Rang-Badge, Name, RP, Fortschrittsbalken
- Habits getrennt in "Täglich" und "Wöchentlich" Sektionen
- Streak-Pill bei Habits mit aktivem Streak
- Bottom Navigation: Heute / Statistik / Rang / Einstellungen

### Statistik (`app/(tabs)/stats.tsx`)

- 4 Stat-Karten: Längster Streak, Diese Woche %, Aktuelle RP, Tage aktiv
- Streak-Grid: 28 Tage × alle Habits (scrollbar bei vielen Habits)
- Completion-Rate Balken pro Habit
- RP-Verlaufskurve (letzte 30 Tage)
- Gesamte Seite scrollbar via ScrollView

### Rang (`app/(tabs)/rank.tsx`)

- Aktueller Rang gross mit Icon, Name, RP, Fortschrittsbalken
- Abstiegsschutz-Banner (grün = sicher, gelb = Warnung, rot = droht Abstieg)
- Vollständige Rang-Liste: Bronze → Challenger mit Status (erreicht / aktuell / gesperrt)

### Habit erstellen (`app/habit/create.tsx`)

- Textfeld für Name
- Frequenz-Auswahl: Täglich / Wöchentlich (2 Karten)
- Icon-Grid (12 Icons zur Auswahl)
- Erinnerungs-Toggle mit Uhrzeit-Picker
- Zurück-Pfeil + "Speichern" Button

### Einstellungen (`app/(tabs)/settings.tsx`)

- Habit-Liste mit Bearbeiten/Löschen (Löschen = archivieren, nie wirklich löschen)
- Benachrichtigungen: Tägliche Zusammenfassung, Abstiegs-Warnung
- Darstellung: Erscheinungsbild (System/Hell/Dunkel), Wochenstart (Mo/So)
- Daten: Exportieren, Alles zurücksetzen

---

## Wichtige Implementierungs-Regeln

### Allgemein

- **TypeScript strict mode** immer aktiviert (`"strict": true` in tsconfig.json)
- Keine `any` Types verwenden — lieber `unknown` mit Type Guard
- Funktionale Komponenten + React Hooks, keine Class Components
- Alle Texte auf **Deutsch** (App ist für deutschsprachigen Nutzer)

### Datenhaltung

- Habits **niemals wirklich löschen** — immer `archivedAt` setzen
- Alle Daten mit `AsyncStorage` unter klar benannten Keys speichern:
  - `@habitrank/habits` — Habit[]
  - `@habitrank/logs` — HabitLog[]
  - `@habitrank/rp` — RPState
  - `@habitrank/settings` — AppSettings
- Datum immer als `"YYYY-MM-DD"` String speichern, niemals als Date-Objekt in Storage

### RP-Berechnung

- RP-Berechnung **täglich einmal** beim App-Start ausführen (für den Vortag)
- `lastUpdatedDate` prüfen um Doppel-Berechnungen zu vermeiden
- Streak-Multiplikator auf den gerundeten Ganzzahlwert runden

### Benachrichtigungen

- Expo Notifications API (`expo-notifications`) verwenden
- Immer nach Permission fragen bevor Notifications geplant werden
- Bei Ablehnung: graceful degradation, kein Crash

### Styling

- Kein externes UI-Framework (keine NativeBase, keine Tamagui)
- React Native `StyleSheet.create()` für alle Styles
- Gemeinsame Farben/Abstände in `src/constants/theme.ts` definieren
- Dark Mode via `useColorScheme()` Hook unterstützen

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
npx jest --watch            # Tests im Watch-Modus

eas build --platform ios --profile preview   # TestFlight Build
```

---

## Entwicklungsphasen

- [x] Phase 0: Design und Planung abgeschlossen
- [ ] Phase 1: TypeScript/React Native Grundlagen lernen + Expo Setup
- [ ] Phase 2: MVP — Habit-Liste, Abhaken, lokale Speicherung
- [ ] Phase 3: Rang-System — RP-Berechnung, Soft/Hard-Abstieg, Streak
- [ ] Phase 4: Polish — Design, Animationen, Benachrichtigungen, TestFlight

---

## Bekannte offene Entscheidungen

- Wann genau wird die tägliche RP-Berechnung ausgelöst? (App-Start vs. Mitternacht)
- Wie werden wöchentliche Habits in der Statistik visualisiert?
- Daten-Export Format: JSON oder CSV?
