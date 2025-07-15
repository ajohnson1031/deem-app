import { Feather, FontAwesome6, Ionicons, Octicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtomValue } from 'jotai';
import { Text, TouchableOpacity, View } from 'react-native';

import { pendingTransactionsAtom } from '~/atoms';
import { HeaderNavProps, RootStackParamList } from '~/types';

const HeaderNav = ({
  showBack = false,
  showClose = false,
  showHeaderOptions = false,
  showSettingsOnly = false,
  showNotificationsOnly = false,
  showLogout = false,
  theme = 'DARK',
  title,
  onBackPress,
  onLogoutPress,
}: HeaderNavProps) => {
  const pendingTransactions = useAtomValue(pendingTransactionsAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const previousRoute = useNavigationState((state) => {
    const routes = state.routes;
    const currentIndex = state.index;

    // Return previous route if exists
    return currentIndex > 0 ? routes[currentIndex - 1].name : null;
  });

  return (
    <View className="mx-3 mb-6 mt-3 flex flex-row justify-between">
      <TouchableOpacity
        className={cn('relative w-[91px] p-3', {
          visible: showBack || showClose,
          invisible: !showBack && !showClose,
        })}
        onPress={() => {
          if (onBackPress) {
            onBackPress();
          } else {
            if (!!previousRoute && !['PinEntryScreen', 'PinSetupScreen'].includes(previousRoute))
              navigation.goBack();
          }
        }}
        disabled={!showBack && !showClose}>
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

      <Text
        className={cn('flex flex-1 self-center text-center text-xl font-semibold', {
          visible: title,
          invisible: !title,
        })}>
        {title}
      </Text>

      <View
        className={cn('invisible', {
          '!visible': showHeaderOptions || showLogout,
        })}>
        {!showLogout ? (
          <View className="flex flex-row justify-end gap-1">
            <TouchableOpacity
              className={cn('p-3', { visible: !showSettingsOnly, invisible: showSettingsOnly })}
              onPress={() => navigation.navigate('PendingTransactions')}
              disabled={showSettingsOnly}>
              <Octicons name="bell" size={24} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
              {!!pendingTransactions.length && (
                <View className="absolute right-1.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600">
                  <Text className="text-xs font-bold text-white">{pendingTransactions.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={cn('p-3', {
                visible: !showNotificationsOnly,
                invisible: showNotificationsOnly,
              })}
              onPress={() => navigation.navigate('Settings')}
              disabled={showNotificationsOnly}>
              <Octicons name="gear" size={24} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className={cn('w-[91px] flex-row justify-end gap-2 p-3 pr-2')}
            onPress={onLogoutPress}
            disabled={showNotificationsOnly}>
            <Feather name="log-out" size={24} color="#c10007" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HeaderNav;
