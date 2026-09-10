const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    rules: {
      'no-console': 'warn',
      // Diese Regel (Teil der React-Compiler-Vorbereitung) markiert auch das
      // Standard-"Daten beim Mount laden"-Pattern (useEffect(() => load(), [load]))
      // als Fehler, obwohl setState dort erst nach einem await passiert.
      // Als Warnung statt Fehler, bis die Regel das differenzierter behandelt.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['node_modules/', '.expo/'],
  },
];
