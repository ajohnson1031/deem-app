import { CountryCode } from 'libphonenumber-js';

interface UserDataInfo {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  avatarUri?: string;
  countryCode?: CountryCode;
  callingCode?: string;
}

interface UserDataFormProps {
  onComplete: (data: UserDataInfo) => void;
  onCancel: () => void;
}

type UserData = {
  name: string;
  username: string;
  email: string;
  password: string;
  avatarUri?: string;
  phoneNumber?: string;
  countryCode?: CountryCode;
  callingCode?: string;
};

type UserDataKey = keyof UserData;

export type { UserData, UserDataFormProps, UserDataInfo, UserDataKey };
