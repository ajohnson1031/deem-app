import { PIN_STORAGE_KEY, WALLET_STORAGE_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const clearAuthData = async () => {
  await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
  await AsyncStorage.removeItem(WALLET_STORAGE_KEY);
};
