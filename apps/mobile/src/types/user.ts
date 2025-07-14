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
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface BasicInfoStepProps {
  onComplete: (data: UserData) => void;
}

interface StepTwoWalletProps {
  onComplete: (wallet: { walletAddress: string; seed: string; twoFactorEnabled: boolean }) => void;
}

type UserDataKey = keyof UserData;

export type { BasicInfoStepProps, StepTwoWalletProps, UserData, UserDataKey };
