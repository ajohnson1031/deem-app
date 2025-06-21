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
  const pendingTransactions = useAtomValue(pendingTransactionsAtom);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const previousRoute = useNavigationState((state) => {
    const routes = state.routes;
    const currentIndex = state.index;

    // Return previous route if exists
    return currentIndex > 0 ? routes[currentIndex - 1].name : null;
  });

  return (
    <View
      className={cn('mx-3 mb-6 mt-3 flex flex-row', {
        'justify-start': showBack && !showHeaderOptions,
        '!justify-between': showBack && showHeaderOptions,
        'justify-end': !showBack && showHeaderOptions,
      })}>
      {(showBack || showClose) && (
        <TouchableOpacity
          className="relative p-3"
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
        <View className="flex flex-row justify-end gap-1">
          {!showSettingsOnly && (
            <View>
              <TouchableOpacity
                className="p-3"
                onPress={() => navigation.navigate('PendingTransactions')}>
                <Octicons name="bell" size={24} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
                {!!pendingTransactions.length && (
                  <View className="absolute right-1.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600">
                    <Text className="text-xs font-bold text-white">
                      {pendingTransactions.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
          {!showNotificationsOnly && (
            <TouchableOpacity className="p-3" onPress={() => navigation.navigate('Settings')}>
              <Octicons name="gear" size={24} color={theme === 'LIGHT' ? '#FFF' : '#000'} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default HeaderNav;
