import cn from 'classnames';
import { useAtomValue } from 'jotai';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { currentTxAtom } from '~/atoms';
import { Contact } from '~/types';
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
  const { name, username, avatarUrl } = contact;
  const tx = useAtomValue(currentTxAtom);

  const splitName = name.split(' ');
  const [first, last] = [splitName[0], splitName[1] || ''];
  const backgroundColor = getColorIndex(contact.id);
  const isSelected = tx.recipientId === contact.id;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible
      accessibilityLabel={`Contact: ${name}`}
      className={cn('rounded-full', {
        'mr-4 w-20 items-center': isSuggested,
        'flex-row items-center gap-4': !isSuggested,
        'bg-slate-100': isSelected && !isSuggested,
      })}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="h-16 w-16 rounded-full bg-gray-700"
          onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
        />
      ) : (
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor }}>
          <Text className="text-2xl font-medium text-white">
            {first[0]}
            {last[0] || ''}
          </Text>
        </View>
      )}

      {isSuggested ? (
        <Text className="mt-2 text-center text-sm font-medium text-gray-800" numberOfLines={2}>
          {`${first}\n${last}`}
        </Text>
      ) : (
        <View>
          <Text className="text-xl font-semibold text-gray-800">{name}</Text>
          <Text className="text-md text-gray-500">{username}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ContactListItem;
