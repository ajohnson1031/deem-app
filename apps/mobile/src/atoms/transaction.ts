import { atom } from 'jotai';

import { Contact } from '~/types/contacts';

type TxType = 'PAY' | 'REQUEST';

interface CurrentTxType {
  amount: string;
  type: TxType;
  memo: string | null;
  recipient: Contact | Record<string, any>;
}

const currentTxAtom = atom<CurrentTxType>({
  amount: '0',
  type: 'PAY',
  memo: null,
  recipient: {},
});

export { currentTxAtom };
export type { TxType };
