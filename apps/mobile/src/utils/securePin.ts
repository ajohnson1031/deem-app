// utils/securePin.ts
import * as SecureStore from 'expo-secure-store';

const savePin = async (pin: string) => {
  await SecureStore.setItemAsync('userPin', pin);
};

const getStoredPin = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('userPin');
};

const PIN_CELL_COUNT = 4;

export { getStoredPin, PIN_CELL_COUNT, savePin };
