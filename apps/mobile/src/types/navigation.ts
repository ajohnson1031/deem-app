import { Transaction } from '~/types';

export type RootStackParamList = {
  Home: undefined;
  Pin: undefined;
  Wallet: undefined;
  AuthGate: undefined;
  Send: undefined;
  TxHistory: undefined;
  TxConfirmation: { tx: Transaction };
  TxSubmission: { tx: Transaction };
  PendingTransactions: undefined;
  Contacts: undefined;
  Settings: undefined;
};
