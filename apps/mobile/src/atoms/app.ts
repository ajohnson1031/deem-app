import { atom } from 'jotai';
import { AppStateStatus } from 'react-native';

export const appReadyAtom = atom(false);
export const appStateAtom = atom<AppStateStatus>('active');
