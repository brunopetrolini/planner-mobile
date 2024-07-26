import { api } from './api';

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

type CreateTrip = Omit<TripDetails, 'id' | 'is_confirmed'> & {
  emails_to_invite: string[];
};

async function getById(id: string): Promise<TripDetails> {
  const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);
  return data.trip;
}

async function create(payload: CreateTrip): Promise<{ tripId: string }> {
  const { data } = await api.post<{ tripId: string }>('/trips', {
    owner_name: 'Bruno Petrolini',
    owner_email: 'bruno.petrolini@mail.com',
    ...payload,
  });
  return data;
}

export const tripServer = { create, getById };
