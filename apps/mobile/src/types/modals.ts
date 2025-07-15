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
  mode?: EncryptionModalMode;
}

export { EncryptionModalMode };
export type { BaseModalProps, PassphrasePromptModalProps };
