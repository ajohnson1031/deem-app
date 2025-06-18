import { atom } from 'jotai';
import { Wallet } from 'xrpl';

import { ApprovedCurrency } from '~/constants';
import { WalletBalanceResult } from '~/types';

const walletAtom = atom<Wallet | null>(null);
const walletAddressAtom = atom(
  (get) => get(walletAtom)?.address ?? 'rEco4zsuN7pjMfZ6BFYbjSCVYgUsxNvYj5'
); // TODO: Remove static value and replace with null
const walletBalanceAtom = atom<WalletBalanceResult>({ success: false, balance: 0 });

const currencyAtom = atom<ApprovedCurrency>('XRP');

export { currencyAtom, walletAddressAtom, walletAtom, walletBalanceAtom };
