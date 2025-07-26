interface BaseModalProps {
  visible: boolean;
  onConfirm: (params?: any) => void;
  onCancel: () => void;
}

enum EncryptionModalMode {
  IMPORT = 'import',
  EXPORT = 'export',
}

interface PassphrasePromptModalProps extends BaseModalProps {
  isProcessing?: boolean;
  mode?: EncryptionModalMode;
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

export { EncryptionModalMode };
export type { AvatarPickerProps, BaseModalProps, PassphrasePromptModalProps };
