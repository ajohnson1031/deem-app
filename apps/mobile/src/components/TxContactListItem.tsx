import { Image, Text, View } from 'react-native';

import { Contact } from '~/types/contacts';

const TxContactListItem = ({
  recipient,
  label,
}: {
  recipient: Contact | Record<string, any>;
  label: string;
}) => {
  const { avatarUrl, name, username } = recipient || { avatarUrl: '', name: '', username: '' };
  const splitName = name?.split(' ');
  const [first, last] = [splitName[0], splitName[splitName.length - 1]];
  return (
    <View className="mx-6 flex-col rounded-lg p-3">
      <Text className="mb-2 font-medium text-stone-900">{label}</Text>
      <View className="flex flex-row gap-4 rounded-lg bg-black/10">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-20 w-20 rounded-lg bg-gray-700"
            onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-lg bg-gray-700">
            <Text className="text-2xl font-normal text-white">{`${first[0]}${last[0]}`}</Text>
          </View>
        )}
        <View className="flex justify-center">
          <Text className="text-xl font-bold text-stone-900">{name}</Text>
          <Text className="text-lg font-medium text-stone-900/70">{username}</Text>
        </View>
      </View>
    </View>
  );
};

export default TxContactListItem;
