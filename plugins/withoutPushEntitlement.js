const { withEntitlementsPlist } = require('expo/config-plugins');

// HabitRank nutzt nur lokale Notifications (siehe notificationService.ts),
// nie Remote-Push. Der expo-notifications Plugin setzt trotzdem automatisch
// das "aps-environment" Entitlement, das eine kostenpflichtige Apple
// Developer Membership zum Signieren voraussetzt. Da wir es nicht brauchen,
// entfernen wir es hier wieder — muss in app.json NACH "expo-notifications"
// stehen, damit dieser Schritt danach ausgeführt wird.
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
