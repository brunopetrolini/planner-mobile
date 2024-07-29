import dayjs from 'dayjs';
import { Calendar as CalendarIcon, Clock, PlusIcon, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Keyboard, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { Input } from '@/components/input';
import { Modal } from '@/components/modal';
import { activitiesServer } from '@/server/activities-server';
import { colors } from '@/styles/colors';
import type { TripData } from './[id]';

type ActivitiesProps = {
  tripDetails: TripData;
};

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

export function Activities({ tripDetails }: ActivitiesProps) {
  const [showModal, setShowModal] = useState(MODAL.NONE);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);

  const [activityTitle, setActivityTitle] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityHour, setActivityHour] = useState('');

  function resetNewActivityFields() {
    setActivityTitle('');
    setActivityDate('');
    setActivityHour('');
  }

  async function handleCreateActivity() {
    try {
      if (!activityTitle || !activityDate || !activityHour) {
        return Alert.alert('Cadastrar atividade', 'Preencha todos os campos para continuar.');
      }

      setIsCreatingActivity(true);

      await activitiesServer.create({
        tripId: tripDetails.id,
        title: activityTitle,
        occurs_at: dayjs(activityDate).add(Number(activityHour), 'hour').toString(),
      });

      Alert.alert('Nova atividade', 'A atividade foi cadastrada com sucesso.', [
        {
          text: 'OK, continuar',
          onPress: () => {
            setShowModal(MODAL.NONE);
            resetNewActivityFields();
          },
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingActivity(false);
    }
  }

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1">Atividades</Text>

        <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} size={20} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>

      <Modal
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades."
        visible={showModal === MODAL.NEW_ACTIVITY}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="mt-3 mb-8">
          <Input variant="secondary">
            <Tag color={colors.zinc[400]} size={20} />
            <Input.Field placeholder="Nome da atividade" onChangeText={setActivityTitle} value={activityTitle} />
          </Input>

          <View className="w-full flex-row mt-2 mb-3 gap-2">
            <Input variant="secondary" className="flex-1">
              <CalendarIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Quando?"
                onChangeText={setActivityDate}
                value={activityDate ? dayjs(activityDate).format('DD [de] MMMM') : ''}
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
                onPressIn={() => setShowModal(MODAL.CALENDAR)}
              />
            </Input>

            <Input variant="secondary" className="flex-1">
              <Clock color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Horário"
                onChangeText={(text) => setActivityHour(text.replace('.', '').replace(',', ''))}
                value={activityHour}
                keyboardType="numeric"
              />
            </Input>
          </View>

          <Button onPress={handleCreateActivity} isLoading={isCreatingActivity}>
            <Button.Title>Salvar atividade</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar data"
        subtitle="Selecione a data da atividade"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4 mb-8">
          <Calendar
            onDayPress={(day) => setActivityDate(day.dateString)}
            markedDates={{ [activityDate]: { selected: true } }}
            initialDate={dayjs(tripDetails.starts_at).toISOString()}
            minDate={dayjs(tripDetails.starts_at).toISOString()}
            maxDate={dayjs(tripDetails.ends_at).toISOString()}
          />

          <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
