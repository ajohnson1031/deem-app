import { atom } from 'jotai';

import { MOCK_COMPLETED_TRANSACTIONS, MOCK_PENDING_TRANSACTIONS } from '~/mocks/transactions';
import { Transaction } from '~/types';

const initialTx: Transaction = {
  amount: '0',
  type: 'PAYMENT',
  direction: null,
  currency: 'XRP',
};

const currentTxAtom = atom<Transaction>(initialTx);
const transactionsAtom = atom<Transaction[]>(MOCK_COMPLETED_TRANSACTIONS);
const pendingTransactionsAtom = atom<Transaction[]>(
  MOCK_PENDING_TRANSACTIONS.filter(
    (tx) => tx.status === 'pending' && tx.direction === 'incoming' && tx.type === 'REQUEST'
  )
);

export { currentTxAtom, initialTx, pendingTransactionsAtom, transactionsAtom };
