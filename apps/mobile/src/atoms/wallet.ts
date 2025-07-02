import { atom } from 'jotai';
import { Wallet } from 'xrpl';

import { ApprovedCurrency, WalletBalanceResult } from '~/types';

const walletAtom = atom<Wallet | null>(null);
const walletAddressAtom = atom((get) => get(walletAtom)?.address ?? null);

const walletBalanceAtom = atom<WalletBalanceResult & { loading?: boolean }>({
  success: false,
  balance: 0,
  loading: true,
});

const currencyAtom = atom<ApprovedCurrency>('XRP');

export { currencyAtom, walletAddressAtom, walletAtom, walletBalanceAtom };
