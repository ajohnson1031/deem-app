import { Ionicons, Octicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtomValue } from 'jotai';
import { Text, TouchableOpacity, View } from 'react-native';

import { pendingTransactionsAtom } from '~/atoms';
import { RootStackParamList, Theme } from '~/types';

const HeaderNav = ({
  showBack = false,
  showClose = false,
  showHeaderOptions = false,
  showSettingsOnly = false,
  showNotificationsOnly = false,
  theme = 'DARK',
  onBackPress,
}: {
  showBack?: boolean;
  showClose?: boolean;
  showHeaderOptions?: boolean;
  showSettingsOnly?: boolean;
  showNotificationsOnly?: boolean;
  theme?: Theme;
  onBackPress?: () => void;
}) => {
  const pendingTransactions = useAtomValue(pendingTransactionsAtom).filter(
    (tx) => tx.status === 'pending' && tx.direction === 'incoming' && tx.type === 'REQUEST'
  );

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const previousRoute = useNavigationState((state) => {
    const routes = state.routes;
    const currentIndex = state.index;

    // Return previous route if exists
    return currentIndex > 0 ? routes[currentIndex - 1].name : null;
  });

  return (
    <View
      className={cn('m-6 flex flex-row', {
        'justify-start': showBack && !showHeaderOptions,
        '!justify-between': showBack && showHeaderOptions,
        'justify-end': !showBack && showHeaderOptions,
      })}>
      {(showBack || showClose) && (
        <TouchableOpacity
          onPress={() => {
            if (onBackPress) {
              onBackPress();
            } else {
              if (!!previousRoute && !['PinEntryScreen', 'PinSetupScreen'].includes(previousRoute))
                navigation.goBack();
            }
          }}>
          {showBack && (
            <FontAwesome6
              name="arrow-left-long"
              size={20}
              color={theme === 'LIGHT' ? '#FFF' : '#000'}
            />
          )}
          {showClose && (
            <Ionicons name="close" size={32} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
          )}
        </TouchableOpacity>
      )}
      {showHeaderOptions && (
        <View className="flex flex-row justify-end gap-5">
          {!showSettingsOnly && (
            <View>
              <TouchableOpacity
                className="mt-[1px]"
                onPress={() => navigation.navigate('PendingTransactions')}>
                <Octicons name="bell" size={24} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
              </TouchableOpacity>
              {!!pendingTransactions.length && (
                <View className="absolute -right-2 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600">
                  <Text className="text-xs font-bold text-white">{pendingTransactions.length}</Text>
                </View>
              )}
            </View>
          )}
          {!showNotificationsOnly && (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Octicons name="gear" size={24} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default HeaderNav;
