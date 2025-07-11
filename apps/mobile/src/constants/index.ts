import { KeyboardTypeOptions } from 'react-native';

import { UserDataKey } from '~/types';

export type FieldType = {
  placeholder: string;
  name: UserDataKey;
  matches: RegExp;
  textContentType: string;
  keyboardType: KeyboardTypeOptions;
  errorMessage: string;
  maxLength: number;
  secure?: boolean;
};

const FIELDS: FieldType[] = [
  {
    placeholder: 'Name',
    name: 'name',
    keyboardType: 'default',
    textContentType: 'name',
    maxLength: 100,
    matches: /^[A-Za-z.\s]+$/, // only letters and spaces
    errorMessage: 'Name may contain letters, spaces & periods only.',
  },
  {
    placeholder: 'Username',
    name: 'username',
    keyboardType: 'default',
    textContentType: 'username',
    maxLength: 30,
    matches: /^[a-zA-Z0-9_.-]{6,30}$/,
    errorMessage:
      'Username must be 6 - 30 characters in length and may contain letters, numbers, hyphens, underscores & periods only.',
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
    maxLength: 30,
    matches: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s@]).{8,30}$/, // strong password, excludes @
    errorMessage:
      'Password must be 8 - 30 chars and include uppercase, lowercase, number, and special character (not @).',
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
