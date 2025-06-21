import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Contact, RootStackParamList } from '~/types';

type ApprovedCurrency = 'USD' | 'XRP';
type TxStatus =
  | 'DRAFT' // Created but not submitted
  | 'PENDING' // Awaiting recipient action (for requests)
  | 'APPROVED' // Approved by recipient, but not yet sent on XRPL
  | 'DECLINED' // Declined by recipient
  | 'SUBMITTED' // Submitted to XRPL, awaiting validation
  | 'SUCCESS' // Successfully validated on XRPL
  | 'FAILED' // Failed on XRPL
  | 'CANCELLED'; // Voided by sender or expired

type TxType = 'PAYMENT' | 'REQUEST';
type TxListType = 'CONFIRMATION' | 'TX';
type TxDirection = 'INCOMING' | 'OUTGOING' | null;

type Transaction = {
  id?: string;

  // Basic metadata
  type: TxType; // 'PAYMENT' | 'REQUEST'
  direction: TxDirection; // 'INCOMING' | 'OUTGOING' | null
  recipientId?: string; // Optional contact reference
  memo?: string;

  // Amount and currency
  currency?: ApprovedCurrency; // 'USD' | 'XRP'
  amount: string; // Final amount in display currency
  originalAmount?: string; // Pre-fee amount (if fee was added)
  feeIncluded?: boolean;
  feeAmount?: string; // USD
  feeInXrp?: string; // XRP

  // Status tracking
  status?: TxStatus; // 'PENDING' | 'COMPLETED' | 'FAILED' | etc.

  // XRPL metadata (for completed on-chain transactions)
  hash?: string;
  ledgerIndex?: number;
  destinationTag?: number;
  deliveredAmount?: string;
  conversionRateAtExecution?: number;
  xrplStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
  xrplTimestamp?: number; // Actual XRPL close_time, if available

  // Timestamps for key lifecycle events
  timestamps?: {
    draftedAt?: number; // When user starts entering a transaction
    createdAt?: number; // When sender confirms and sends the tx (before XRPL)
    approvedAt?: number; // When recipient explicitly approves the tx
    submittedAt?: number; // When tx is submitted to XRPL (by recipient)
    confirmedAt?: number; // When tx is validated on XRPL
    failedAt?: number; // If XRPL submission fails
    cancelledAt?: number; // If sender cancels before recipient approval
  };
};

type TxConfirmationScreenProps = {
  route: { params: { tx: Transaction } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'TxConfirmation'>;
};

type TxSubmissionScreenProps = {
  route: { params: { tx: Transaction; recipient: Contact } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'TxSubmission'>;
};

const TX_STATUS_LABELS: Record<TxStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  SUBMITTED: 'Submitted',
  SUCCESS: 'Confirmed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const STATUS_GROUPS = {
  IN_PROGRESS: ['DRAFT', 'PENDING', 'SUBMITTED'] as TxStatus[],
  COMPLETED: ['APPROVED', 'DECLINED', 'SUCCESS', 'FAILED', 'CANCELLED'] as TxStatus[],
};

export { STATUS_GROUPS, TX_STATUS_LABELS };
export type {
  ApprovedCurrency,
  Transaction,
  TxConfirmationScreenProps,
  TxDirection,
  TxListType,
  TxStatus,
  TxSubmissionScreenProps,
  TxType,
};
