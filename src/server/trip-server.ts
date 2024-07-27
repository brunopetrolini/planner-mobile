import { api } from './api';

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

async function getById(id: string): Promise<TripDetails> {
  const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);
  return data.trip;
}

type CreateTrip = Omit<TripDetails, 'id' | 'is_confirmed'> & {
  emails_to_invite: string[];
};

async function create(payload: CreateTrip): Promise<{ tripId: string }> {
  const { data } = await api.post<{ tripId: string }>('/trips', {
    owner_name: 'Bruno Petrolini',
    owner_email: 'bruno.petrolini@mail.com',
    ...payload,
  });
  return data;
}

type UpdateTrip = Omit<TripDetails, 'is_confirmed'>;

async function update(payload: UpdateTrip): Promise<void> {
  const { id, ...rest } = payload;
  await api.put(`/trips/${payload.id}`, rest);
}

export const tripServer = { create, getById, update };
