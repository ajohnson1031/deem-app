interface BaseModalProps {
  visible: boolean;
  onConfirm: (params?: any) => void;
  onCancel: () => void;
}

enum EncryptionModalMode {
  IMPORT = 'import',
  EXPORT = 'export',
}

interface AvatarPickerProps {
  id?: string;
  className?: string;
  avatarUri?: string;
  initials: string;
  isLoggedIn?: boolean;
  noPhotoMessage?: string;
  onPress: () => void;
}

enum ModalPromptVariant {
  PASSPHRASE = 'passphrase',
  PASSWORD = 'password',
  TWO_FACTOR = '2fa',
}

interface ModalPromptProps extends BaseModalProps {
  variant: ModalPromptVariant;
  title?: string;
  description?: string;
  value: string;
  onChangeValue: (val: string) => void;
  isProcessing?: boolean; // Only for passphrase/password
  error?: string;
  mode?: EncryptionModalMode;
}

export { EncryptionModalMode, ModalPromptVariant };
export type { AvatarPickerProps, BaseModalProps, ModalPromptProps };
