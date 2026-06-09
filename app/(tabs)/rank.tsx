import { StyleSheet, Text, View } from 'react-native';

export default function RankScreen() {
  return (
    <View style={styles.container}>
      <Text>Rang</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
