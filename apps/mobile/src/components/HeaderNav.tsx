import { Octicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '~/types/navigation';

const HeaderNav = ({
  showBack = true,
  showHeaderOptions = true,
  onBackPress,
}: {
  showBack?: boolean;
  showHeaderOptions?: boolean;
  onBackPress?: () => void;
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View
      className={cn('m-6 flex flex-row', {
        'justify-start': showBack && !showHeaderOptions,
        '!justify-between': showBack && showHeaderOptions,
        'justify-end': !showBack && showHeaderOptions,
      })}>
      {showBack && (
        <TouchableOpacity
          onPress={() => {
            if (onBackPress) {
              onBackPress();
            } else navigation.goBack();
          }}>
          <FontAwesome6 name="arrow-left-long" size={20} color="#000" />
        </TouchableOpacity>
      )}
      {showHeaderOptions && (
        <View className="flex flex-row justify-end gap-4">
          <TouchableOpacity className="mt-[1px]">
            <Octicons name="bell" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Octicons name="gear" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HeaderNav;
