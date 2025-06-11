import { atom } from 'jotai';

import { MOCK_TRANSACTIONS } from '~/mocks/transactions';
import { Transaction, TxStatus } from '~/types/transaction';

type TxType = 'PAY' | 'REQUEST';

interface CurrentTxType {
  amount: string;
  type: TxType;
  memo: string | null;
  recipient: string | null;
  status: TxStatus | null;
}

const initialTx: CurrentTxType = {
  amount: '0',
  type: 'PAY',
  memo: null,
  recipient: null,
  status: null,
};

const currentTxAtom = atom<CurrentTxType>(initialTx);
const transactionsAtom = atom<Transaction[]>(MOCK_TRANSACTIONS);
const pendingTransactionsAtom = atom<Transaction[]>(
  MOCK_TRANSACTIONS.filter((tx) => tx.status === 'pending')
);

export { currentTxAtom, pendingTransactionsAtom, transactionsAtom };
export type { CurrentTxType, TxType };
