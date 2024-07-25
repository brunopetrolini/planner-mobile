import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World!</Text>
      <Text style={styles.subtitle}>This is a React Native app</Text>

      <StatusBar barStyle="dark-content" translucent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#fafafa',
    fontSize: 32,
  },

  subtitle: {
    color: '#a1a1aa',
    fontSize: 24,
  },
});
