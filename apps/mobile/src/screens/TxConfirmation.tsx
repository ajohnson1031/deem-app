import { Feather } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toggle from 'react-native-toggle-element';

import { currencyAtom, xrpInitialPriceAtom, xrpPriceAtom } from '~/atoms';
import { TxListItem } from '~/components';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList, Transaction } from '~/types';
import { calculateFees, capitalize, formatWithCommas } from '~/utils';

const TxConfirmationScreen = ({
  route: {
    params: { tx: initialTx },
  },
  navigation,
}: {
  route: { params: { tx: Transaction } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'TxConfirmation'>;
}) => {
  const currency = useAtomValue(currencyAtom);
  const xrpInitial = useAtomValue(xrpInitialPriceAtom);
  const xrpLive = useAtomValue(xrpPriceAtom);

  const xrpPriceUSD = xrpLive || xrpInitial;
  const [payFees, setPayFees] = useState(initialTx.feeIncluded || false);
  const [tx, setTx] = useState<Transaction>({ ...initialTx, currency });

  const parsedAmount = parseFloat(tx.amount);

  const feeData = useMemo(() => {
    if (!xrpPriceUSD || isNaN(parsedAmount)) return null;
    return calculateFees({
      type: 'BANK',
      amount: parsedAmount,
      currency,
      xrpPriceUSD,
    });
  }, [parsedAmount, currency, xrpPriceUSD]);

  const handleBackPress = () => {
    navigation.navigate('Contacts');
  };

  const handleFeeToggle = () => {
    const newValue = !payFees;
    setPayFees(newValue);

    if (!feeData) return;

    const newTx: Transaction = newValue
      ? {
          ...tx,
          originalAmount: tx.amount,
          amount:
            currency === 'USD'
              ? feeData.totalUsdWithFees.toFixed(2)
              : feeData.totalInXrp.toFixed(6),
          feeIncluded: true,
          feeAmount: feeData.fee.toFixed(2),
          feeInXrp: currency === 'XRP' ? feeData.feeInXrp?.toFixed(6) : undefined,
        }
      : {
          ...tx,
          amount: tx.originalAmount || tx.amount,
          originalAmount: undefined,
          feeIncluded: false,
          feeAmount: undefined,
          feeInXrp: undefined,
        };

    setTx(newTx);
  };

  const displayAmount = parseFloat(tx.amount);

  return (
    <CoreLayout showBack onBackPress={handleBackPress}>
      <View className="mx-6 mt-10 flex-1 gap-y-4">
        <Text className="mb-2 text-5xl font-semibold text-stone-900">
          {tx.type === 'PAYMENT' ? 'Confirm\nPayment?' : 'Confirm\nRequest?'}
        </Text>

        <View className="rounded-xl border border-gray-200 py-3">
          <TxListItem transaction={tx} listType="CONFIRMATION" />

          {/* Amount Display */}
          <View className="p-3">
            <View className="border-y border-gray-200 py-4">
              <Text className="mb-1 ml-3 font-bold text-stone-800">
                {`Tx Amount${payFees ? ' (with fees)' : ''}:`}
              </Text>
              <View className="flex flex-col gap-2 p-3 pb-0">
                <View className="flex flex-row items-baseline">
                  {currency === 'USD' && <Text className="text-3xl font-semibold">$</Text>}
                  <Text className="text-5xl text-stone-900">
                    {formatWithCommas(displayAmount.toString())}
                  </Text>
                  {currency === 'XRP' && (
                    <Text className="ml-1 text-xl font-semibold text-stone-900">XRP</Text>
                  )}
                </View>

                {/* Equivalent currency display */}
                {xrpPriceUSD && (
                  <Text className="-mt-1 ml-1 text-lg font-medium text-gray-500">
                    {currency === 'USD'
                      ? `${(displayAmount / xrpPriceUSD).toFixed(6)} XRP`
                      : `$${(displayAmount * xrpPriceUSD).toFixed(2)}`}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Fee Toggle & Breakdown */}
          <View className="rounded-lg bg-white px-3 pb-3">
            <View className="flex flex-row items-center justify-between">
              <Text className="my-1 ml-3 font-bold text-stone-800">
                {`Include Conversion Fee with ${capitalize(tx.type)}?`}
              </Text>
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

            {payFees && feeData && (
              <View className="ml-3 mt-3">
                <Text className="text-base font-medium text-gray-700">
                  Fee: ${feeData.fee.toFixed(2)}
                </Text>
                {currency === 'XRP' && feeData.feeInXrp && (
                  <Text className="text-base font-medium text-gray-700">
                    Fee in XRP: {feeData.feeInXrp}
                  </Text>
                )}
                <Text className="text-md mt-1 italic text-gray-500">{feeData.breakdown}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <View className="absolute bottom-4 mt-8 flex flex-row justify-center gap-x-5">
          <TouchableOpacity
            onPress={() => navigation.navigate('TxSubmission', { tx })}
            className={cn(
              'flex w-full flex-row items-center justify-center gap-2 rounded-xl py-4',
              {
                'bg-green-600': tx.type === 'PAYMENT',
                'bg-sky-600': tx.type === 'REQUEST',
              }
            )}>
            <Text className="text-xl font-medium text-white">
              Send {capitalize(tx.type === 'PAYMENT' ? 'Payment' : tx.type)}
            </Text>
            <FontAwesome6 name="arrow-right-long" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default TxConfirmationScreen;
