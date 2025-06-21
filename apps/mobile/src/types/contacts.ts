import { Transaction } from '~/types/transaction';

type Contact = {
  id: string;
  name: string; // Full name
  avatarUrl?: string;
  username: string;
  walletAddress: string;

  // Optional metadata
  createdAt?: number;
  updatedAt?: number;
  isFavorite?: boolean;
  isBlocked?: boolean;
  note?: string;
};

interface SwipeableTransactionRowProps {
  transaction: Transaction;
  contact: Contact;
  onApprove: (tx: Transaction) => void;
  onDeny: (tx: Transaction) => void;
}

export type { Contact, SwipeableTransactionRowProps };
