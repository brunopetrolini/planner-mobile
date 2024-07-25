import { StatusBar, Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-zinc-950">
      <Text className="text-zinc-50 text-4xl">Hello World!</Text>
      <Text className="text-zinc-400 text-2xl">This is a React Native app</Text>

      <StatusBar barStyle="light-content" translucent />
    </View>
  );
}
