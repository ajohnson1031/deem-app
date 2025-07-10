import { Feather, FontAwesome, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export enum MenuIconType {
  FEATHER = 'feather',
  FONT_AWESOME = 'fontawesome',
  FONT_AWESOME6 = 'fontawesome6',
  MATERIAL_COMM = 'material_community',
}

interface MenuListItemProps {
  iconType: MenuIconType;
  iconName: any;
  iconSize?: number;
  labelText: string;
  helperText: string;
  hasBackground?: boolean;
  onPress: () => void;
}

const MenuListItem = ({
  iconType,
  iconName,
  iconSize = 18,
  labelText,
  helperText,
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
    case MenuIconType.MATERIAL_COMM:
      Icon = <MaterialCommunityIcons name={iconName} size={iconSize} color="#4b5563" />;
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
      <Feather name="chevron-right" size={16} />
    </TouchableOpacity>
  );
};

export default MenuListItem;
