import { api } from './api';

type Activity = {
  id: string;
  occurs_at: string;
  title: string;
};

type ActivityCreate = Omit<Activity, 'id'> & {
  tripId: string;
};

type ActivityResponse = {
  activities: {
    date: string;
    activities: Activity[];
  }[];
};

async function create({ tripId, occurs_at, title }: ActivityCreate) {
  const { data } = await api.post<{ activityId: string }>(`/trips/${tripId}/activities`, { occurs_at, title });
  return data;
}

async function getActivitiesByTripId(tripId: string) {
  const { data } = await api.get<ActivityResponse>(`/trips/${tripId}/activities`);
  return data;
}

export const activitiesServer = { create, getActivitiesByTripId };
