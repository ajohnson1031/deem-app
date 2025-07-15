import { FontAwesome } from '@expo/vector-icons';
import cn from 'classnames';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { getColorIndex } from '~/utils';

interface AvatarPickerProps {
  id?: string;
  className?: string;
  avatarUri?: string;
  initials: string;
  isLoggedIn?: boolean;
  noPhotoMessage?: string;
  onPress: () => void;
}

const AvatarPicker = ({
  id,
  avatarUri,
  className = 'mb-10',
  initials,
  isLoggedIn,
  noPhotoMessage = `No photo selected.\nInitials used.`,
  onPress,
}: AvatarPickerProps) => {
  const backgroundColor = id ? getColorIndex(id) : '#0284c7';

  return (
    <View className={cn('flex-row items-center gap-10', className)}>
      <TouchableOpacity onPress={onPress}>
        {avatarUri ? (
          <>
            <Image
              source={{ uri: isLoggedIn ? `${avatarUri}?${Date.now()}` : avatarUri }}
              className="h-28 w-28 rounded-full"
              resizeMode="cover"
            />
            <View className="absolute -bottom-1 left-20 flex items-center justify-center self-start rounded-full border-2 border-white bg-gray-200 p-2">
              <FontAwesome name="camera" size={22} color="#4b5563" />
            </View>
          </>
        ) : (
          <>
            <View
              className="h-28 w-28 items-center justify-center rounded-full"
              style={{ backgroundColor }}>
              <Text className="text-3xl font-medium text-white">{initials}</Text>
            </View>
            <View className="absolute -bottom-1 left-20 flex items-center justify-center self-start rounded-full border-2 border-white bg-gray-200 p-2">
              <FontAwesome name="camera" size={22} color="#4b5563" />
            </View>
          </>
        )}
      </TouchableOpacity>

      <View className="">
        {!avatarUri && <Text className="text-md text-slate-500">{noPhotoMessage}</Text>}
      </View>
    </View>
  );
};

export default AvatarPicker;
