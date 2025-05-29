import { atom } from 'jotai';

import { Contact } from '~/types/contacts';

type TxType = 'PAY' | 'REQUEST';

interface CurrentTxType {
  amount: string;
  type: TxType;
  memo: string | null;
  recipient: Contact | null;
}

const initialTx: CurrentTxType = {
  amount: '0',
  type: 'PAY',
  memo: null,
  recipient: null,
};

const currentTxAtom = atom<CurrentTxType>(initialTx);

export { currentTxAtom };
export type { TxType };
