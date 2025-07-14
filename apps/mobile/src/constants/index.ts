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

const REGEX = {
  NAME: /^[A-Za-z.\s]+$/,
  USERNAME: /^[a-zA-Z0-9_.-]{6,30}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s@]).{8,30}$/,
  PHONE_NUMBER: /.*/,
};

const FIELDS: FieldType[] = [
  {
    placeholder: 'Name',
    name: 'name',
    keyboardType: 'default',
    textContentType: 'name',
    maxLength: 100,
    matches: REGEX.NAME,
    errorMessage: 'Name may contain letters, spaces & periods only.',
  },
  {
    placeholder: 'Username',
    name: 'username',
    keyboardType: 'default',
    textContentType: 'username',
    maxLength: 30,
    matches: REGEX.USERNAME,
    errorMessage:
      'Username must be 6 - 30 characters in length and may contain letters, numbers, hyphens, underscores & periods only.',
  },
  {
    placeholder: 'Email',
    name: 'email',
    keyboardType: 'email-address',
    textContentType: 'emailAddress',
    maxLength: 100,
    matches: REGEX.EMAIL,
    errorMessage: 'Enter a valid email address.',
  },
  {
    placeholder: 'Password',
    name: 'password',
    keyboardType: 'default',
    textContentType: 'newPassword',
    secure: true,
    maxLength: 30,
    matches: REGEX.PASSWORD, // strong password, excludes @
    errorMessage:
      'Password must be 8 - 30 chars and include one of each of the following: uppercase, lowercase, number, special character (not @).',
  },
  {
    placeholder: 'Phone (optional)',
    name: 'phoneNumber',
    keyboardType: 'phone-pad',
    textContentType: 'telephoneNumber',
    maxLength: 50,
    matches: REGEX.PHONE_NUMBER,
    errorMessage: 'Enter a valid phone number.',
  },
];

export { FIELDS, REGEX };
