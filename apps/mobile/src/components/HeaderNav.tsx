import { FontAwesome } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '~/types/navigation';

const HeaderNav = ({
  showBack = false,
  showHeaderOptions = false,
}: {
  showBack?: boolean;
  showHeaderOptions?: boolean;
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View
      className={cn('flex flex-row', {
        'justify-start': showBack && !showHeaderOptions,
        '!justify-between': showBack && showHeaderOptions,
        'justify-end': !showBack && showHeaderOptions,
      })}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left-long" size={20} color="#000" />
        </TouchableOpacity>
      )}
      {showHeaderOptions && (
        <View className="flex flex-row justify-end gap-3">
          <TouchableOpacity>
            <FontAwesome name="bell" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <FontAwesome6 name="gear" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HeaderNav;
