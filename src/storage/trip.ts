import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIP_STORAGE_KEY = '@planner:tripId';

async function save(id: string) {
  await AsyncStorage.setItem(TRIP_STORAGE_KEY, id);
}

async function get() {
  return await AsyncStorage.getItem(TRIP_STORAGE_KEY);
}

async function remove() {
  await AsyncStorage.removeItem(TRIP_STORAGE_KEY);
}

export const tripStorage = { get, remove, save };
