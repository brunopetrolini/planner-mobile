import { ArrowRight, Calendar as CalendarIcon, MapPin, Settings2, UserRoundPlus } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { colors } from '@/styles/colors';
import { useState } from 'react';

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAILS = 2,
}

export default function Index() {
  const [formStep, setFormStep] = useState(StepForm.TRIP_DETAILS);

  function handleNextStepForm() {
    if (formStep === StepForm.TRIP_DETAILS) {
      return setFormStep(StepForm.ADD_EMAILS);
    }
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
          <Input.Field placeholder="Para onde?" editable={formStep === StepForm.TRIP_DETAILS} />
        </Input>

        <Input>
          <CalendarIcon color={colors.zinc[400]} size={20} />
          <Input.Field placeholder="Quando?" editable={formStep === StepForm.TRIP_DETAILS} />
        </Input>

        {formStep === StepForm.ADD_EMAILS && (
          <>
            <View className="border-b py-3 border-zinc-800">
              <Button variant="secondary" onPress={() => setFormStep(StepForm.TRIP_DETAILS)}>
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
          <Button.Title>{formStep == StepForm.TRIP_DETAILS ? 'Continuar' : 'Confirmar viagem'}</Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem pela plann.er você automaticamente concorda com nossos{' '}
        <Text className="text-zinc-300 underline">termos de uso e politicas de privacidade</Text>.
      </Text>
    </View>
  );
}
