import { Transaction } from '~/types';

export type RootStackParamList = {
  Home: undefined;
  Signup: undefined;
  Pin: undefined;
  Wallet: undefined;
  AuthGate: undefined;
  Send: undefined;
  TxHistory: undefined;
  TxConfirmation: { tx: Transaction };
  TxSubmission: { tx: Transaction };
  PendingTransactions: undefined;
  Contacts: undefined;
  Convert: undefined;
  Settings: undefined;
  Cards: undefined;
  FeePolicy: undefined;
};
