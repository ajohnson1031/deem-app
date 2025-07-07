import { atom } from 'jotai';
import { CountryCode } from 'libphonenumber-js';

interface UserData {
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  avatarUri?: string;
  countryCode?: CountryCode;
  callingCode?: string;
}

export const registerAtom = atom<UserData>({
  name: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  avatarUri: undefined,
  countryCode: 'US',
  callingCode: '1',
});

export const usernameAvailabilityAtom = atom<{
  checking: boolean;
  available: boolean | null;
}>({ checking: false, available: null });
