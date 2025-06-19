import { Feather } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toggle from 'react-native-toggle-element';

import { currencyAtom } from '~/atoms';
import { TxListItem } from '~/components';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList, Transaction } from '~/types';
import { capitalize, formatWithCommas } from '~/utils';

const TxConfirmationScreen = ({
  route: {
    params: { tx },
  },
  navigation,
}: {
  route: { params: { tx: Transaction } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'TxConfirmation'>;
}) => {
  const currency = useAtomValue(currencyAtom);
  const [payFees, setPayFees] = useState(false);
  const { type, amount } = tx;
  const title = type === 'PAYMENT' ? 'Confirm\nPayment?' : 'Confirm\nRequest?';
  const originalAmount = amount;

  const handleBackPress = () => {
    navigation.navigate('Contacts');
  };

  const handleFeeToggle = () => {
    setPayFees(!payFees);
  };

  return (
    <CoreLayout showBack onBackPress={handleBackPress}>
      <View className="mx-6 mt-10 flex-1 gap-y-4">
        <Text className="mb-2 text-5xl font-semibold text-stone-900">{title}</Text>

        <View className="rounded-xl bg-white py-3">
          <TxListItem transaction={tx} listType="CONFIRMATION" />

          {/* Amount Display // TODO: Add USD value, with fees */}
          <View className="p-3">
            <View className="border-y border-gray-200 py-4">
              <Text className="mb-1 ml-3 font-bold text-stone-800">{`Tx. Amount${payFees ? ' (with fees)' : ''}:`}</Text>
              <View className="flex flex-row items-baseline p-3 pb-0">
                {currency === 'USD' && <Text className="text-3xl font-semibold">$</Text>}
                <Text className="text-5xl text-stone-900">{formatWithCommas(amount)}</Text>
                {currency === 'XRP' && (
                  <Text className="text-xl font-semibold text-stone-900">XRP</Text>
                )}
              </View>
            </View>
          </View>

          {/* Fee Toggle Display */}
          <View className="rounded-lg bg-white px-3 pb-3">
            <View className="flex flex-row justify-between">
              <Text className="text-stone-6800 my-1 ml-3 font-bold">{`Include Fees with ${capitalize(tx.type)}?`}</Text>
              <TouchableOpacity className="mr-3" onPress={() => navigation.navigate('FeePolicy')}>
                <Feather name="help-circle" size={24} color="#0284c7" />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-baseline rounded-lg p-3 pb-0">
              <Toggle
                value={payFees}
                onPress={handleFeeToggle}
                trackBar={{
                  activeBackgroundColor: '#16a34a',
                  inActiveBackgroundColor: '#6b7280',
                  borderActiveColor: '#16a34a',
                  borderInActiveColor: '#6b7280',
                  borderWidth: 3,
                  width: 80,
                  height: 35,
                }}
                trackBarStyle={{ zIndex: -1, width: 65 }}
                thumbStyle={{ height: 29, width: 29, backgroundColor: 'white' }}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons // TODO: Make functional */}
        <View className="absolute bottom-4 mt-8 flex flex-row justify-center gap-x-5">
          <TouchableOpacity
            onPress={() => navigation.navigate('TxSubmission', { tx })}
            className={cn(
              ' flex w-full flex-row items-center justify-center gap-2 rounded-xl py-4',
              {
                'bg-green-600': type === 'PAYMENT',
                'bg-sky-600': type === 'REQUEST',
              }
            )}>
            <Text className="text-xl font-medium text-white">
              Send {capitalize(type === 'PAYMENT' ? 'Payment' : type)}
            </Text>
            <FontAwesome6 name="arrow-right-long" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default TxConfirmationScreen;
