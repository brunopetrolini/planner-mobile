import { StatusBar, Text, View } from 'react-native';

export default function Index() {
  return (
    <View>
      <Text>Hello World!</Text>
      <Text>This is a React Native app</Text>

      <StatusBar barStyle="dark-content" translucent />
    </View>
  );
}
