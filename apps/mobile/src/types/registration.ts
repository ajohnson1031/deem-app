interface StepOneUserInfo {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  avatarUri?: string;
}

interface StepOneFormProps {
  onComplete: (data: StepOneUserInfo) => void;
  onCancel: () => void;
}

type UserData = {
  name: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
};

type UserDataKey = keyof UserData;

export type { StepOneFormProps, StepOneUserInfo, UserData, UserDataKey };
