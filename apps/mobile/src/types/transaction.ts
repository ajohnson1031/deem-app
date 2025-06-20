import { ApprovedCurrency } from '~/constants';

type TxStatus = 'pending' | 'accepted' | 'declined' | 'incomplete';
type TxType = 'PAYMENT' | 'REQUEST';
type TxListType = 'CONFIRMATION' | 'TX';
type TxDirection = 'incoming' | 'outgoing' | null;

type Transaction = {
  id?: string;
  type: TxType; // 'PAYMENT' | 'REQUEST'
  direction: TxDirection; // 'INCOMING' | 'OUTGOING' | null
  recipientId?: string; // Contact ID
  currency: ApprovedCurrency;
  amount: string; // Final amount, in the specified currency
  originalAmount?: string; // Pre-fee amount (if fee was included)
  feeIncluded?: boolean; // Was the fee added on top?
  feeAmount?: string; // Fee in USD
  feeInXrp?: string; // Fee in XRP (if applicable)
  memo?: string;
  status?: TxStatus; // 'PENDING', 'COMPLETED', etc.
  timestamp?: number;
};

export type { Transaction, TxDirection, TxListType, TxStatus, TxType };
