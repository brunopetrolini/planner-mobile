import dayjs from 'dayjs';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar as CalendarIcon, CalendarRange, Info, MapPin, Settings2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { TripDetails, tripServer } from '@/server/trip-server';
import { colors } from '@/styles/colors';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { DateData } from 'react-native-calendars';
import { Activities } from './activities';
import { Details } from './details';

export type TripData = TripDetails & {
  when: string;
};

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
}

export default function Trip() {
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
  const [showModal, setShowModal] = useState(MODAL.NONE);

  const [tripDetails, setTripDetails] = useState<TripData>({} as TripData);
  const [option, setOption] = useState<'activities' | 'details'>('activities');
  const [destination, setDestination] = useState('');
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

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

      setDestination(trip.destination);

      setTripDetails({ ...trip, when: `${destination}, ${startDay} à ${endDay} de ${endMonth}` });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  function handleSelectDates(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });
    setSelectedDates(dates);
  }

  async function handleUpdateTrip() {
    try {
      if (!tripId) return;

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert(
          'Atualizar viagem',
          'Lembres-e de, além de preencher o destino, selecione a data de início em fim da viagem.'
        );
      }

      setIsUpdatingTrip(true);

      await tripServer.update({
        id: tripId,
        destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      });

      Alert.alert('Viagem atualizada', 'Sua viagem foi atualizada com sucesso.', [
        {
          text: 'Ok',
          onPress: () => {
            setShowModal(MODAL.NONE);
            getTripDetails();
          },
        },
      ]);

      ('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingTrip(false);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  if (isLoadingTrip) {
    return <Loading />;
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails?.when} readOnly />

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-9 h-9 bg-zinc-800 items-center justify-center rounded-md"
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
        >
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {option === 'activities' ? <Activities tripDetails={tripDetails} /> : <Details tripId={tripDetails.id} />}

      <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
        <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
          <Button
            className="flex-1"
            onPress={() => setOption('activities')}
            variant={option === 'activities' ? 'primary' : 'secondary'}
          >
            <CalendarRange color={option === 'activities' ? colors.lime[950] : colors.zinc[200]} size={20} />
            <Button.Title>Atividades</Button.Title>
          </Button>

          <Button
            className="flex-1"
            onPress={() => setOption('details')}
            variant={option === 'details' ? 'primary' : 'secondary'}
          >
            <Info color={option === 'details' ? colors.lime[950] : colors.zinc[200]} size={20} />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 my-4 pb-4">
          <Input variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field placeholder="Para onde?" onChangeText={setDestination} value={destination} />
          </Input>

          <Input variant="secondary">
            <CalendarIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Quando?"
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
              showSoftInputOnFocus={false}
              value={selectedDates.formatDatesInText}
              editable={showModal === MODAL.CALENDAR}
            />
          </Input>

          <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.UPDATE_TRIP)}
      >
        <View className="gap-4 mt-4 mb-6">
          <Calendar onDayPress={handleSelectDates} markedDates={selectedDates.dates} minDate={dayjs().toISOString()} />

          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
