import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TouchableOpacity, View } from 'react-native';

import type { RootStackParamList } from '~/types/navigation';

const FooterNav = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentRoute = useNavigationState((state) => state.routes[state.index].name);

  const navItems: { icon: keyof typeof FontAwesome6.glyphMap; route: keyof RootStackParamList }[] =
    [
      { route: 'Wallet', icon: 'wallet' },
      { route: 'Send', icon: 'dollar-sign' },
      { route: 'TxHistory', icon: 'clock-rotate-left' },
    ];

  return (
    <View className="absolute bottom-8 left-0 right-0 flex-row justify-around overflow-hidden py-4">
      {navItems.map(({ icon, route }) => {
        const isActive = currentRoute === route;
        return (
          <TouchableOpacity key={route} onPress={() => navigation.navigate(route as any)}>
            <FontAwesome6 name={icon} size={24} color={isActive ? '#000' : '#AAA'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FooterNav;
