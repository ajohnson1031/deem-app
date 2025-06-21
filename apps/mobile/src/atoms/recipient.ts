import { atom } from 'jotai';

import { Contact } from '~/types';

export const recipientAtom = atom<Contact | null>(null);
