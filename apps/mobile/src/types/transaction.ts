type TxStatus = 'pending' | 'accepted' | 'declined' | 'incomplete';
type TxType = 'PAYMENT' | 'REQUEST';
type TxListType = 'CONFIRMATION' | 'TX';
type TxDirection = 'incoming' | 'outgoing' | null;

type Transaction = {
  id?: string;
  type: TxType;
  direction: TxDirection;
  recipientId?: string; // Contact ID (so you can look up name/avatar)
  amount: string;
  memo?: string;
  status?: TxStatus;
  timestamp?: number;
};

export type { Transaction, TxDirection, TxListType, TxStatus, TxType };
