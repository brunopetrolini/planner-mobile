import dayjs from 'dayjs';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar as CalendarIcon, CalendarRange, Info, Mail, MapPin, Settings2, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { participantsServer } from '@/server/participants-server';
import { TripDetails, tripServer } from '@/server/trip-server';
import { tripStorage } from '@/storage/trip';
import { colors } from '@/styles/colors';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { validateInput } from '@/utils/validateInput';
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
  CONFIRM_PRESENCE = 3,
}

export default function Trip() {
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
  const [isConfirmingPresence, setIsConfirmingPresence] = useState(false);
  const [showModal, setShowModal] = useState(MODAL.NONE);

  const [tripDetails, setTripDetails] = useState<TripData>({} as TripData);
  const [option, setOption] = useState<'activities' | 'details'>('activities');
  const [destination, setDestination] = useState('');
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const { id: tripId, participant: participantId } = useLocalSearchParams<{ id: string; participant?: string }>();

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);

      if (participantId) {
        setShowModal(MODAL.CONFIRM_PRESENCE);
      }

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
          'Lembre-se de, além de preencher o destino, selecione a data de início em fim da viagem.'
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

  async function handleConfirmPresence() {
    try {
      if (!tripId || !participantId) {
        return;
      }

      if (!guestName.trim() || !guestEmail.trim()) {
        return Alert.alert('Confirmar presença', 'Preencha seu nome e e-mail para confirmar sua presença.');
      }

      if (validateInput.email(guestEmail.trim())) {
        return Alert.alert('Confirmar presença', 'Preencha um e-mail válido.');
      }

      setIsConfirmingPresence(true);

      await participantsServer.confirmTripByParticipantId({
        email: guestEmail.trim(),
        name: guestName,
        participantId,
      });

      await tripStorage.save(tripId);

      Alert.alert('Confirmar presença', 'Sua presença foi confirmada com sucesso.', [
        {
          text: 'Ok, continuar',
          onPress: async () => {
            await getTripDetails();
            setShowModal(MODAL.NONE);
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Confirmar presença', 'Ocorreu um erro ao confirmar sua presença, tente novamente.');
    } finally {
      setIsConfirmingPresence(false);
    }
  }

  async function handleRemoveTrip() {
    try {
      Alert.alert('Remover viagem', 'Tem certeza que deseja remover essa viagem?', [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            await tripStorage.remove();
            router.navigate('/');
          },
        },
      ]);
    } catch (error) {
      console.error(error);
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

          <TouchableOpacity activeOpacity={0.8} onPress={handleRemoveTrip}>
            <Text className="text-red-400 text-center mt-4 mb-2">Remover viagem</Text>
          </TouchableOpacity>
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

      <Modal title="Confirmar presença" visible={showModal === MODAL.CONFIRM_PRESENCE}>
        <View className="gap-4 mt-4 mb-8">
          <Text className="text-zinc-400 front-regular leading-6 mt-2">
            Você foi convidado(a) para participar de uma viagem para{' '}
            <Text className="font-semibold text-zinc-100">{tripDetails.destination}</Text> nas datas de{' '}
            <Text className="font-semibold text-zinc-100">{`${dayjs(tripDetails.starts_at).format(
              'D [de] MMMM'
            )} à ${dayjs(tripDetails.ends_at).format('D [de] MMMM')}`}</Text>
            . {'\n\n'}Para confirmar sua presença, preencha os dados abaixo:
          </Text>

          <Input variant="secondary">
            <User color={colors.zinc[400]} size={20} />
            <Input.Field placeholder="Seu nome completo" onChangeText={setGuestName} value={guestName} />
          </Input>

          <Input variant="secondary">
            <Mail color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="E-mail de confirmação"
              onChangeText={setGuestEmail}
              value={guestEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </Input>

          <Button onPress={handleConfirmPresence} isLoading={isConfirmingPresence}>
            <Button.Title>Confirmar minha presença</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
