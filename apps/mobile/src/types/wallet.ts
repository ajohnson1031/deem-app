type WalletBalanceResult = {
  success: boolean;
  balance: number;
  error?: string;
};

interface ManualWalletEntryProps {
  walletAddress?: string;
  seed?: string;
  isValidWalletAddress: boolean;
  isValidSeed: boolean;
  onChangeWallet?: (text: string) => void;
  onChangeSeed?: (text: string) => void;
  onConfirm: () => void;
}

export type { ManualWalletEntryProps, WalletBalanceResult };
