import { ReactNode } from 'react';
import { TextInputProps } from 'react-native';

enum FieldVariant {
  STANDARD = 'standard',
  MASKED = 'masked',
}

interface LabelFieldWithCopyProps {
  label: string | ReactNode;
  value: string;
  valueKey: string;
  copiedMessage: string;
  requires2fa?: boolean;
  className?: string;
  variant?: FieldVariant;
  onToggle?: () => void;
}

interface CountdownInputProps extends TextInputProps {
  textClassName?: string;
  variant?: FieldVariant;
}

interface PasswordInputProps extends TextInputProps {
  showCountdown?: boolean;
}

export { FieldVariant };
export type { CountdownInputProps, LabelFieldWithCopyProps, PasswordInputProps };
