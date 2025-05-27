import cn from 'classnames';
import { useAtom } from 'jotai';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { currentTxAtom } from '~/atoms/transaction';
import { Contact } from '~/types/contacts';

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
          className="mb-1 h-14 w-14 rounded-full bg-gray-300"
          onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-gray-200">
          <Text className="text-lg font-bold text-gray-600">{name[0]}</Text>
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
