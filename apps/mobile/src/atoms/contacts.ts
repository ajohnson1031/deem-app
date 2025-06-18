import { atom } from 'jotai';

import { MOCK_ALL_CONTACTS } from '~/mocks/contacts';
import { Contact } from '~/types';

const contactsAtom = atom<Contact[]>(MOCK_ALL_CONTACTS);

const suggestedContactsAtom = atom((get) => {
  const allContacts = get(contactsAtom);
  // Logic to determine suggested contacts, e.g., based on recent activity
  return allContacts.slice(0, 5); // temporary: top 5 for example
});

export { contactsAtom, suggestedContactsAtom };
