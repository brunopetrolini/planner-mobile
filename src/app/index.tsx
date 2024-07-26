import dayjs from 'dayjs';
import { ArrowRight, Calendar as CalendarIcon, MapPin, Settings2, UserRoundPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, Keyboard, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';

import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { Input } from '@/components/input';
import { Modal } from '@/components/modal';
import { colors } from '@/styles/colors';
import { calendarUtils, type DatesSelected } from '@/utils/calendarUtils';

enum FORM_STEP {
  TRIP_DETAILS = 1,
  ADD_EMAILS = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUEST = 2,
}

export default function Index() {
  const [formStep, setFormStep] = useState(FORM_STEP.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(MODAL.NONE);

  const [destination, setDestination] = useState('');
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

  function handleNextStepForm() {
    if (destination.trim().length === 0 || selectedDates.startsAt || selectedDates.endsAt) {
      return Alert.alert('Detalhes da viagem', 'Preencha todas as informações da viagem para continuar.');
    }

    if (destination.length < 4) {
      return Alert.alert('Detalhes da viagem', 'O destino deve ter ao menos 4 caracteres');
    }

    if (formStep === FORM_STEP.TRIP_DETAILS) {
      return setFormStep(FORM_STEP.ADD_EMAILS);
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

  return (
    <View className="flex-1 justify-center items-center px-5">
      <Image source={require('@/assets/logo.png')} className="h-8" resizeMode="contain" />

      <Image source={require('@/assets/bg.png')} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e planeje sua{'\n'}próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Para onde?"
            editable={formStep === FORM_STEP.TRIP_DETAILS}
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input>
          <CalendarIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Quando?"
            editable={formStep === FORM_STEP.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPressIn={() => formStep === FORM_STEP.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)}
            value={selectedDates.formatDatesInText}
          />
        </Input>

        {formStep === FORM_STEP.ADD_EMAILS && (
          <>
            <View className="border-b py-3 border-zinc-800">
              <Button variant="secondary" onPress={() => setFormStep(FORM_STEP.TRIP_DETAILS)}>
                <Button.Title>Alterar local/data</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field placeholder="Quem estará na viagem?" />
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm}>
          <Button.Title>{formStep == FORM_STEP.TRIP_DETAILS ? 'Continuar' : 'Confirmar viagem'}</Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem pela plann.er você automaticamente concorda com nossos{' '}
        <Text className="text-zinc-300 underline">termos de uso e politicas de privacidade</Text>.
      </Text>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar onDayPress={handleSelectDates} markedDates={selectedDates.dates} minDate={dayjs().toISOString()} />

          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
