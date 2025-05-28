import cn from 'classnames';
import { useAtom } from 'jotai';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { currentTxAtom } from '~/atoms/transaction';
import { Contact } from '~/types/contacts';
import { getColorIndex } from '~/utils';

const ContactListItem = ({
  contact,
  isSuggested,
  onPress,
}: {
  contact: Contact;
  isSuggested: boolean;
  onPress: () => void;
}) => {
  const { id, name, username, avatarUrl } = contact;
  const [tx] = useAtom(currentTxAtom);

  const splitName = name.split(' ');
  const [first, last] = [splitName[0], splitName[splitName.length - 1]];
  const backgroundColor = getColorIndex(contact.id);
  const isSelected = tx.recipient === contact;

  return (
    <TouchableOpacity
      key={id}
      onPress={onPress}
      className={cn('rounded-full', {
        'mr-4 h-fit items-center': isSuggested,
        'mb-3 flex-row items-center gap-4': !isSuggested,
        'bg-slate-200': isSelected && !isSuggested,
      })}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="h-14 w-14 rounded-full bg-gray-700"
          onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
        />
      ) : (
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor }}>
          <Text className="text-2xl font-medium text-white">{`${first[0]}${last[0]}`}</Text>
        </View>
      )}
      {isSuggested ? (
        <Text className="text-xs font-medium text-gray-800">{`${name.length > 8 ? name.substring(0, 7) + '...' : name}`}</Text>
      ) : (
        <View>
          <Text className="font-semibold text-gray-800">{name}</Text>
          <Text className="text-sm text-gray-500">{username}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ContactListItem;
