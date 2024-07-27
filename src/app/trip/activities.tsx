import { Text, View } from 'react-native';

import type { TripData } from './[id]';

type ActivitiesProps = {
  tripDetails: TripData;
};

export function Activities({ tripDetails }: ActivitiesProps) {
  return (
    <View className="flex-1">
      <Text className="text-white">{tripDetails.destination}</Text>
    </View>
  );
}
