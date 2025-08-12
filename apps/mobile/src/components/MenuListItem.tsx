import {
  Feather,
  FontAwesome,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { MenuIconType, MenuListItemProps } from '~/types';

const MenuListItem = ({
  iconType,
  iconName,
  iconSize = 18,
  labelText,
  helperText,
  chevronText,
  hasBackground = true,
  onPress,
}: MenuListItemProps) => {
  let Icon;

  switch (iconType) {
    case MenuIconType.FEATHER:
      Icon = <Feather name={iconName} size={iconSize} color="#4b5563" />;
      break;
    case MenuIconType.FONT_AWESOME:
      Icon = <FontAwesome name={iconName} size={iconSize} color="#4b5563" />;
      break;
    case MenuIconType.FONT_AWESOME6:
      Icon = <FontAwesome6 name={iconName} size={iconSize} color="#4b5563" />;
      break;
    case MenuIconType.MATERIAL:
      Icon = <MaterialIcons name={iconName} size={iconSize} color="#4b5563" />;
      break;
    case MenuIconType.MATERIAL_COMM:
      Icon = <MaterialCommunityIcons name={iconName} size={iconSize} color="#4b5563" />;
      break;
    case MenuIconType.OCTICONS:
      Icon = <Octicons name={iconName} size={iconSize} color="#4b5563" />;
      break;
  }

  return (
    <TouchableOpacity className="flex-row items-center justify-between py-3" onPress={onPress}>
      <View className="flex-row items-center gap-4">
        <View
          className={`flex h-16 w-16 items-center justify-center rounded-full ${hasBackground && 'bg-gray-200'}`}>
          {Icon}
        </View>
        <View>
          <Text className="text-xl font-medium">{labelText}</Text>
          <Text className="text-md text-gray-600">{helperText}</Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        {chevronText && <Text>{chevronText}</Text>}
        <Feather name="chevron-right" size={16} />
      </View>
    </TouchableOpacity>
  );
};

export default MenuListItem;
