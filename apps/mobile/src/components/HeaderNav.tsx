import { Octicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtomValue } from 'jotai';
import { Text, TouchableOpacity, View } from 'react-native';

import { transactionsAtom } from '~/atoms/transaction';
import { RootStackParamList } from '~/types/navigation';
import { Theme } from '~/types/theme';

const HeaderNav = ({
  showBack = true,
  showHeaderOptions = true,
  showSettingsOnly = false,
  showNotificationsOnly = false,
  theme = 'DARK',
  onBackPress,
}: {
  showBack?: boolean;
  showHeaderOptions?: boolean;
  showSettingsOnly?: boolean;
  showNotificationsOnly?: boolean;
  theme?: Theme;
  onBackPress?: () => void;
}) => {
  const pendingTransactions = useAtomValue(transactionsAtom).filter(
    (tx) => tx.status === 'pending'
  );

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
          <FontAwesome6
            name="arrow-left-long"
            size={20}
            color={theme === 'LIGHT' ? '#FFF' : '#000'}
          />
        </TouchableOpacity>
      )}
      {showHeaderOptions && (
        <View className="flex flex-row justify-end gap-4">
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
