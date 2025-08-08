import { EncryptionModalMode } from '~/types/modals';

type WalletBalanceResult = {
  success: boolean;
  balance: number;
  error?: string;
};

interface ManualWalletEntryProps {
  disabled: boolean;
  walletAddress?: string;
  seed?: string;
  isValidWalletAddress: boolean;
  isValidSeed: boolean;
  onChangeWallet?: (text: string) => void;
  onChangeSeed?: (text: string) => void;
  onConfirm: () => void;
}

interface WalletDetailsProps {
  disabled?: boolean;
  address: string;
  publicKey: string;
  seed?: string;
  mode?: EncryptionModalMode;
  passphrase: string;
  passphraseModalVisible: boolean;
  isProcessing: boolean;
  onImportPress: () => Promise<void>;
  onExportPress: () => void;
  onChangePassphrase: (text: string) => void;
  onClosePassphraseModal: () => void;
  onConfirm: () => Promise<void>;
  error: string;
}

export type { ManualWalletEntryProps, WalletBalanceResult, WalletDetailsProps };
