import { api } from './api';

export type Participant = {
  id: string;
  name: string;
  email: string;
  is_confirmed: boolean;
};

type ParticipantConfirm = {
  participantId: string;
  name: string;
  email: string;
};

async function getByTripId(tripId: string) {
  const { data } = await api.get<{ participants: Participant[] }>(`/trips/${tripId}/participants`);
  return data;
}

async function confirmTripByParticipantId({ participantId, name, email }: ParticipantConfirm) {
  await api.patch(`/participants/${participantId}/confirm`, { name, email });
}
export const participantsServer = { getByTripId, confirmTripByParticipantId };
