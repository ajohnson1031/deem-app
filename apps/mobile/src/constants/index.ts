import { KeyboardTypeOptions } from 'react-native';

import { UserDataKey } from '~/types';

const FIELDS: {
  placeholder: string;
  name: UserDataKey;
  matches: RegExp;
  textContentType: string;
  keyboardType: KeyboardTypeOptions;
  errorMessage: string;
  maxLength: number;
  secure?: boolean;
}[] = [
  {
    placeholder: 'Name',
    name: 'name',
    keyboardType: 'default',
    textContentType: 'name',
    maxLength: 50,
    matches: /^[A-Za-z\s]+$/, // only letters and spaces
    errorMessage: 'Name may contain letters and spaces only.',
  },
  {
    placeholder: 'Username',
    name: 'username',
    keyboardType: 'default',
    textContentType: 'username',
    maxLength: 21,
    matches: /^[a-zA-Z0-9_.]{6,21}$/,
    errorMessage:
      'Username must be 6 - 21 characters in length and may contain letters, numbers, periods & underscores only.',
  },
  {
    placeholder: 'Email',
    name: 'email',
    keyboardType: 'email-address',
    textContentType: 'emailAddress',
    maxLength: 100,
    matches: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simple email regex
    errorMessage: 'Enter a valid email address.',
  },
  {
    placeholder: 'Password',
    name: 'password',
    keyboardType: 'default',
    textContentType: 'newPassword',
    secure: true,
    maxLength: 21,
    matches: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s@]).{8,21}$/, // strong password, excludes @
    errorMessage:
      'Password must be 8 - 21 chars and include uppercase, lowercase, number, and special character (not @).',
  },
  {
    placeholder: 'Phone (optional)',
    name: 'phoneNumber',
    keyboardType: 'phone-pad',
    textContentType: 'telephoneNumber',
    maxLength: 50,
    matches: /.*/,
    errorMessage: 'Enter a valid phone number.',
  },
];

export { FIELDS };
