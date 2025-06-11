import { useAtomValue } from 'jotai';

import { contactsAtom } from '~/atoms/contacts';

const useGetContact = (id: string) => {
  const contacts = useAtomValue(contactsAtom);

  return contacts.filter((contact) => contact.id === id)[0];
};

export { useGetContact };
