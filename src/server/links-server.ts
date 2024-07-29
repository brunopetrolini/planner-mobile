import { api } from './api';

export type Link = {
  id: string;
  title: string;
  url: string;
};

type LinkCreate = Omit<Link, 'id'> & {
  tripId: string;
};

async function getLinksByTripId(tripId: string) {
  const { data } = await api.get<{ links: Link[] }>(`/trips/${tripId}/links`);
  return data;
}

async function create({ tripId, title, url }: LinkCreate) {
  const { data } = await api.post<{ linkId: string }>(`/trips/${tripId}/links`, { title, url });
  return data;
}

export const linksServer = { getLinksByTripId, create };
