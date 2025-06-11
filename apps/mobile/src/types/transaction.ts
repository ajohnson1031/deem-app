type TxStatus = 'pending' | 'accepted' | 'declined';
type TxType = 'PAY' | 'REQUEST';

type Transaction = {
  id: string;
  type: TxType;
  direction: 'incoming' | 'outgoing';
  contactId: string; // Contact ID (so you can look up name/avatar)
  amount: number;
  memo?: string;
  status: TxStatus;
  timestamp: number;
};

export type { Transaction, TxStatus, TxType };
