import { useAtomValue } from 'jotai';
import { v4 as uuidv4 } from 'uuid';

import { contactsAtom } from '~/atoms';
import { getColorIndex } from '~/utils';

const useGetContact = (id: string) => {
  const contacts = useAtomValue(contactsAtom);

  const matchedContact = contacts.filter((contact) => contact.id === id)[0];

  const bgColor = getColorIndex(matchedContact.id ?? uuidv4());
  const { name } = matchedContact;

  const splitName = name?.split(' ');
  const [first, last] = [splitName[0], splitName[splitName.length - 1]];
  return { matchedContact, name: [first, last], bgColor };
};

export { useGetContact };
