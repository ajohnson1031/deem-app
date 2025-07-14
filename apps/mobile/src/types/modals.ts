interface BaseModalProps {
  visible: boolean;
  onConfirm: (params?: any) => void;
  onCancel: () => void;
}

interface PassphrasePromptModalProps extends BaseModalProps {
  mode?: 'export' | 'import';
}

export type { BaseModalProps, PassphrasePromptModalProps };
