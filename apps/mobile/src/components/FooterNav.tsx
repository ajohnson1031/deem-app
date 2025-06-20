import { FontAwesome } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { TouchableOpacity, View } from 'react-native';

import type { RootStackParamList } from '~/types';

const FooterNav = ({ footerClassName }: { footerClassName?: string }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentRoute = useNavigationState((state) => state.routes[state.index].name);

  const navItems: {
    icon: any;
    route: keyof RootStackParamList;
  }[] = [
    { route: 'Cards', icon: 'credit-card-alt' },
    { route: 'Wallet', icon: 'wallet' },
    { route: 'Send', icon: 'dollar-sign' },
    { route: 'TxHistory', icon: 'clock-rotate-left' },
  ];

  return (
    <View
      className={cn(
        'w-full flex-row justify-around border-t border-gray-200 bg-white py-4 shadow-sm',
        footerClassName
      )}>
      {navItems.map(({ icon, route }) => {
        const isActive = currentRoute === route;
        return (
          <TouchableOpacity key={route} onPress={() => navigation.navigate(route as any)}>
            {route === 'Cards' ? (
              <FontAwesome name={icon} size={24} color={isActive ? '#000' : '#AAA'} />
            ) : (
              <FontAwesome6 name={icon} size={24} color={isActive ? '#000' : '#AAA'} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FooterNav;
