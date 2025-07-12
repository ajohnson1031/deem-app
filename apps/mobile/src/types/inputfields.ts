import { ReactNode } from 'react';
import { TextInputProps } from 'react-native';

enum LabelFieldWithCopyVariant {
  STANDARD = 'standard',
  MASKED = 'masked',
}

interface LabelFieldWithCopyProps {
  label: string | ReactNode;
  value: string;
  valueKey: string;
  copiedMessage: string;
  className?: string;
  variant?: LabelFieldWithCopyVariant;
  onToggle?: () => void;
}

interface CountdownInputProps extends TextInputProps {
  textClassName?: string;
}

interface PasswordInputProps extends TextInputProps {
  showCountdown?: boolean;
}

export { LabelFieldWithCopyVariant };
export type { CountdownInputProps, LabelFieldWithCopyProps, PasswordInputProps };
