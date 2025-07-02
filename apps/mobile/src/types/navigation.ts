import { Contact, Transaction } from '~/types';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Pin: undefined;
  Wallet: undefined;
  Send: undefined;
  TxHistory: undefined;
  TxConfirmation: { tx: Transaction };
  TxSubmission: { tx: Transaction; recipient: Contact };
  PendingTransactions: undefined;
  Contacts: undefined;
  Convert: undefined;
  Conversions: undefined;
  Settings: undefined;
  Cards: undefined;
  FeePolicy: undefined;
};
