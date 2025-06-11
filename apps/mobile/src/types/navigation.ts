import { CurrentTxType } from '~/atoms/transaction';

export type RootStackParamList = {
  Home: undefined;
  Pin: undefined;
  Wallet: undefined;
  AuthGate: undefined;
  Send: undefined;
  TxHistory: undefined;
  TxConfirmation: { tx: CurrentTxType };
  TxFinalConfirmation: { tx: CurrentTxType };
  PendingTransactions: undefined;
  Contacts: undefined;
  Settings: undefined;
};
