import { Image, Text, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { getColorIndex, useGetContact } from '~/utils';

const TxContactListItem = ({ id }: { id: string }) => {
  const backgroundColor = getColorIndex(id ?? uuidv4());
  const { avatarUrl, name, username } = useGetContact(id) || {
    avatarUrl: '',
    name: '',
    username: '',
  };
  const splitName = name?.split(' ');
  const [first, last] = [splitName[0], splitName[splitName.length - 1]];
  return (
    <View className="flex rounded-xl bg-slate-800 p-4">
      <View className="flex flex-row gap-4">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-20 w-20 rounded-full"
            onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
          />
        ) : (
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor }}>
            <Text className="text-3xl font-normal text-white">{`${first[0]}${last[0]}`}</Text>
          </View>
        )}
        <View className="flex justify-center">
          <Text className="text-xl font-bold text-white">{name}</Text>
          <Text className="text-lg font-medium text-white/70">{username}</Text>
        </View>
      </View>
    </View>
  );
};

export default TxContactListItem;
