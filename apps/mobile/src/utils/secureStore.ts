import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

const saveToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

const saveRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
const deleteRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

const saveUser = (user: any) => SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
const getUser = async () => {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
const deleteUser = () => SecureStore.deleteItemAsync(USER_KEY);

export {
  deleteRefreshToken,
  deleteToken,
  deleteUser,
  getRefreshToken,
  getToken,
  getUser,
  saveRefreshToken,
  saveToken,
  saveUser,
};
