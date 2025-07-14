import { Contact, Theme, Transaction } from '~/types';

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Pin: undefined;
  Wallet: undefined;
  Send: undefined;
  TxHistory: undefined;
  TxConfirmation: { tx: Transaction; recipient: Contact };
  TxSubmission: { tx: Transaction; recipient: Contact };
  PendingTransactions: undefined;
  Contacts: undefined;
  Convert: undefined;
  Conversions: undefined;
  Settings: undefined;
  Cards: undefined;
  FeePolicy: undefined;
  ForgotPassword: undefined;
  VerifyPasswordReset: { email: string };
  ResetPassword: { userId: string };
  EditBasicInfo: undefined;
  ManageWallet: undefined;
};

interface HeaderNavProps {
  showBack?: boolean;
  showClose?: boolean;
  showHeaderOptions?: boolean;
  showSettingsOnly?: boolean;
  showNotificationsOnly?: boolean;
  showLogout?: boolean;
  theme?: Theme;
  title?: string;
  onBackPress?: () => void;
  onLogoutPress?: () => void;
}

export type { HeaderNavProps, RootStackParamList };
