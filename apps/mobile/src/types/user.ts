import { CountryCode } from 'libphonenumber-js';

type UserData = {
  id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  avatarUri?: string;
  phoneNumber?: string;
  countryCode?: CountryCode;
  callingCode?: string;
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
};

interface UserDataStepProps {
  onComplete: (data: UserData) => void;
  onCancel: () => void;
}

type UserDataKey = keyof UserData;

export type { UserData, UserDataKey, UserDataStepProps };
