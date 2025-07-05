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

export type { StepOneFormProps, StepOneUserInfo };
