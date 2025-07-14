interface BaseModalProps {
  visible: boolean;
  onConfirm: (params?: any) => void;
  onCancel: () => void;
}

enum ModalMode {
  IMPORT = 'import',
  EXPORT = 'export',
}

interface PassphrasePromptModalProps extends BaseModalProps {
  mode?: ModalMode;
}

export { ModalMode };
export type { BaseModalProps, PassphrasePromptModalProps };
