import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { Participant, type ParticipantProps } from '@/components/participant';
import { TripLink, type TripLinkProps } from '@/components/tripLink';
import { linksServer } from '@/server/links-server';
import { participantsServer } from '@/server/participants-server';
import { colors } from '@/styles/colors';
import { validateInput } from '@/utils/validateInput';

type DetailsProps = {
  tripId: string;
};

enum MODAL {
  NONE = 0,
  ADD_LINK = 1,
  ADD_GUEST = 2,
}

export function Details({ tripId }: DetailsProps) {
  const [showModal, setShowModal] = useState(MODAL.NONE);

  const [isCreatingTripLink, setIsCreatingTripLink] = useState(false);
  const [isLoadingTripLinks, setIsLoadingTripLinks] = useState(true);
  const [isLoadingTripGuests, setIsLoadingTripGuests] = useState(true);

  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);

  function resetLinkFields() {
    setLinkTitle('');
    setLinkUrl('');
  }

  async function handleCreateTripLink() {
    try {
      if (!linkTitle.trim()) {
        return Alert.alert('Link', 'Informe o título do link.');
      }

      if (!validateInput.url(linkUrl.trim())) {
        return Alert.alert('Link', 'Link inválido.');
      }

      setIsCreatingTripLink(true);

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkUrl,
      });

      Alert.alert('Link', 'Link criado com sucesso.', [
        {
          text: 'OK, continuar',
          onPress: async () => {
            setShowModal(MODAL.NONE);
            resetLinkFields();
            await getTripLinks();
          },
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingTripLink(false);
    }
  }

  async function getTripLinks() {
    try {
      const { links } = await linksServer.getLinksByTripId(tripId);
      setLinks(links);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTripLinks(false);
    }
  }

  async function getTripGuests() {
    try {
      const { participants } = await participantsServer.getByTripId(tripId);
      setParticipants(participants);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTripGuests(false);
    }
  }

  useEffect(() => {
    Promise.all([getTripLinks(), getTripGuests()]);
  }, []);

  if (isLoadingTripLinks || isLoadingTripGuests) {
    return <Loading />;
  }

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">Links Importantes</Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 pb-6">Nenhum link adicionado.</Text>
        )}

        <Button variant="secondary" onPress={() => setShowModal(MODAL.ADD_LINK)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Adicionar link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">Convidados</Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4"
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes."
        visible={showModal === MODAL.ADD_LINK}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 mb-8">
          <Input variant="secondary">
            <Input.Field placeholder="Título do link" onChangeText={setLinkTitle} value={linkTitle} />
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="URL do link"
              onChangeText={setLinkUrl}
              value={linkUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Input>

          <Button variant="primary" onPress={handleCreateTripLink} isLoading={isCreatingTripLink}>
            <Button.Title>Salvar link</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
