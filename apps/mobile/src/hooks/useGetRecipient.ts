import { useAtomValue } from 'jotai';
import { v4 as uuidv4 } from 'uuid';

import { recipientAtom } from '~/atoms';
import { getColorIndex } from '~/utils';

const useGetRecipient = () => {
  const recipient = useAtomValue(recipientAtom);

  if (!recipient) return null;

  const bgColor = getColorIndex(recipient.id ?? uuidv4());
  const splitName = recipient.name?.split(' ') ?? [''];
  const [first, last] = [splitName[0], splitName[splitName.length - 1]];

  return {
    matchedContact: recipient,
    name: [first, last],
    bgColor,
  };
};

export { useGetRecipient };
