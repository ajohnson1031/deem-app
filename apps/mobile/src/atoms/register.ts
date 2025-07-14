import { atom } from 'jotai';

import { UserData } from '~/types';

export const registerAtom = atom<UserData>({
  name: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  avatarUri: undefined,
  countryCode: 'US',
  callingCode: '1',
  twoFactorEnabled: false,
});

export const usernameAvailabilityAtom = atom<{
  checking: boolean;
  available: boolean | null;
}>({ checking: false, available: null });
