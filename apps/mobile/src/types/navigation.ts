import { Transaction } from '~/types';

export type RootStackParamList = {
  Home: undefined;
  Pin: undefined;
  Wallet: undefined;
  AuthGate: undefined;
  Send: undefined;
  TxHistory: undefined;
  TxConfirmation: { tx: Transaction };
  TxFinalConfirmation: { tx: Transaction };
  PendingTransactions: undefined;
  Contacts: undefined;
  Settings: undefined;
};
