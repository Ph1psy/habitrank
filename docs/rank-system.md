# Rang-System

## Ränge und RP-Grenzen

| Rang       | Floor | Ceil |
| ---------- | ----- | ---- |
| Bronze     | 0     | 49   |
| Silver     | 50    | 149  |
| Gold       | 150   | 349  |
| Platin     | 350   | 649  |
| Diamond    | 650   | 999  |
| Master     | 1000  | 1499 |
| Challenger | 1500  | ∞    |

## RP-Mechanik

| Aktion                                             | RP          |
| -------------------------------------------------- | ----------- |
| Habit erledigt (täglich)                           | +1          |
| Habit erledigt (wöchentlich)                       | +3          |
| Alle Habits des Tages erledigt                     | +5 Bonus    |
| Streak 7–29 Tage                                   | ×1.5        |
| Streak 30+ Tage                                    | ×2          |
| Habit verpasst (täglich)                           | −1          |
| Kein einziger Habit heute                          | −5          |
| Streak gebrochen                                   | −3 einmalig |
| Wöchentliches Habit nicht erledigt (Sonntag 23:59) | −2          |

Streak-Multiplikator wird auf den nächsten Ganzzahlwert gerundet.
Minimum RP = 0 (nie negativ).

## Abstieg

### Soft-Abstieg

- RP sinken unter den Rang-Floor → Rang bleibt erhalten
- Zähler `daysUnderFloor` wird täglich erhöht (max 3)

### Hard-Abstieg

- Nach 3 aufeinanderfolgenden Tagen unter dem Floor → Abstieg um 1 Rang
- Landung auf `floor` des neuen Rangs
- 1 Tag Abstiegsschutz nach jedem Abstieg

## Wochenlogik

- Woche = Montag bis Sonntag (konfigurierbar: Montag oder Sonntag als Start)
- Wöchentliches Habit kann genau einmal pro Woche abgehakt werden
