import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { TripLink, type TripLinkProps } from '@/components/tripLink';
import { linksServer } from '@/server/links-server';
import { colors } from '@/styles/colors';
import { validateInput } from '@/utils/validateInput';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';

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

  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [links, setLinks] = useState<TripLinkProps[]>([]);

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

  useEffect(() => {
    getTripLinks();
  }, []);

  if (isLoadingTripLinks) {
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
