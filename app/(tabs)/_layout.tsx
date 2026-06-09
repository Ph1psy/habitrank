import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Heute' }} />
      <Tabs.Screen name="stats" options={{ title: 'Statistik' }} />
      <Tabs.Screen name="rank" options={{ title: 'Rang' }} />
      <Tabs.Screen name="settings" options={{ title: 'Einstellungen' }} />
    </Tabs>
  );
}
