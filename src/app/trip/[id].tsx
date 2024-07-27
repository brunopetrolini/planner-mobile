import { Input } from '@/components/input';
import { TripDetails, tripServer } from '@/server/trip-server';
import { colors } from '@/styles/colors';
import dayjs from 'dayjs';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin, Settings2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

type TripData = TripDetails & {
  when: string;
};

export default function Trip() {
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  const [tripDetails, setTripDetails] = useState<TripData>();

  const { id: tripId } = useLocalSearchParams<{ id: string }>();

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);

      if (!tripId) {
        return router.back();
      }

      const trip = await tripServer.getById(tripId);

      const maxLengthDestination = 14;
      const destination =
        trip.destination.length > maxLengthDestination
          ? `${trip.destination.slice(0, maxLengthDestination)}...`
          : trip.destination;

      const startDay = dayjs(trip.starts_at).format('D');
      const endDay = dayjs(trip.ends_at).format('D');
      const endMonth = dayjs(trip.ends_at).format('MMM');

      setTripDetails({ ...trip, when: `${destination}, ${startDay} à ${endDay} de ${endMonth}` });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails?.when} readOnly />

        <TouchableOpacity activeOpacity={0.7} className="w-9 h-9 bg-zinc-800 items-center justify-center rounded-lg">
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>
    </View>
  );
}
