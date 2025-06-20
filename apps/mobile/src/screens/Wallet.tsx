import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { LinearGradient } from 'expo-linear-gradient';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

import { currencyAtom, transactionsAtom, xrpPriceAtom } from '~/atoms';
import { TxListItem } from '~/components';
import { ApprovedCurrency } from '~/constants';
import { useCopyToClipboard, useWallet } from '~/hooks';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types';
import { convertCurrencyAmount, formatFloatClean, formatWithCommas } from '~/utils';

const WalletScreen = () => {
  const { walletAddress, walletBalance, createWallet, refreshBalance, loading } = useWallet();
  const [currency, setCurrency] = useAtom(currencyAtom);
  const { copied, copy } = useCopyToClipboard();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const recentTransactions = useAtomValue(transactionsAtom).slice(0, 4);
  const xrpPriceUSD = useAtomValue(xrpPriceAtom);

  const [currencyOptions] = useState<Record<string, ApprovedCurrency>[]>([
    { label: 'XRP', value: 'XRP' },
    { label: 'USD', value: 'USD' },
  ]);

  const ITEM_HEIGHT = 80;
  const ITEM_SPACING = 8;
  const VISIBLE_ITEMS = 3;
  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS + ITEM_SPACING * (VISIBLE_ITEMS - 1);

  const balanceAsNumber = parseFloat(walletBalance?.balance || '0');
  const { usdAmount, xrpAmount } = convertCurrencyAmount({
    amount: balanceAsNumber,
    fromCurrency: 'XRP', // Wallet balance is always in XRP
    xrpPriceUSD,
  });

  const primaryAmount =
    currency === 'USD' ? formatFloatClean(usdAmount) : formatFloatClean(xrpAmount);

  const secondaryAmount =
    currency === 'USD'
      ? `${formatFloatClean(xrpAmount)} XRP`
      : `$${formatWithCommas(formatFloatClean(usdAmount))}`;

  return (
    <CoreLayout showFooter showHeaderOptions>
      <View className="mx-6 flex-1 items-center justify-center">
        {walletAddress ? (
          <View className="w-full flex-1 flex-col gap-y-6">
            {/* Balance Header */}
            <View className="flex flex-col gap-y-2">
              {/* Refresher */}
              <View className="mb-2 flex flex-row items-center gap-2">
                <Text className="text-lg font-medium text-gray-600">Balance</Text>
                <TouchableOpacity onPress={refreshBalance}>
                  <Fontisto name="spinner-refresh" size={20} color="#0284c7" />
                </TouchableOpacity>
              </View>

              {/* Balance Display */}
              <View className="flex flex-row items-baseline">
                {currency === 'USD' && (
                  <ShimmerPlaceHolder
                    LinearGradient={LinearGradient}
                    visible={!loading}
                    style={{ height: 36, borderRadius: 4 }}>
                    <Text className="text-5xl font-semibold">$</Text>
                  </ShimmerPlaceHolder>
                )}

                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  visible={!loading}
                  style={{ height: 'fit-content', width: 'fit-content', borderRadius: 8 }}>
                  <Text
                    className={cn('text-8xl font-semibold', {
                      '!text-7xl': primaryAmount.length > 6 && primaryAmount.length <= 9,
                      '!text-5xl': primaryAmount.length > 8 && primaryAmount.length < 12,
                      '!text-4xl': primaryAmount.length >= 12,
                    })}>
                    {formatWithCommas(primaryAmount)}
                  </Text>
                </ShimmerPlaceHolder>

                {currency === 'XRP' && (
                  <ShimmerPlaceHolder
                    LinearGradient={LinearGradient}
                    visible={!loading}
                    style={{ height: 30, width: 50, borderRadius: 4 }}>
                    <Text className="text-xl font-semibold">{currency}</Text>
                  </ShimmerPlaceHolder>
                )}
              </View>

              {/* ≈ Equivalent Value */}
              {balanceAsNumber > 0 && xrpPriceUSD > 0 && (
                <Text className="-mt-4 text-lg font-medium text-gray-500">{`${secondaryAmount} ${currency === 'XRP' ? '(in USD)' : ''}`}</Text>
              )}

              {/* Wallet address + currency switch */}
              <View className="mt-4 flex flex-row gap-4">
                <View className="flex w-9/12 flex-row items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 py-4">
                  <Text
                    className="m-0 w-9/12 p-0"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontWeight: 500, color: copied ? '#0284c7' : '#4B5563' }}>
                    {copied ? 'Copied!' : walletAddress}
                  </Text>
                  <TouchableOpacity onPress={() => copy(walletAddress)}>
                    <Feather name="copy" size={20} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                <Dropdown
                  style={[styles.dropdown]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={currencyOptions}
                  labelField="label"
                  valueField="value"
                  value={currency}
                  onChange={(item) => {
                    setCurrency(item.value);
                  }}
                />
              </View>
            </View>

            {/* Convert Button */}
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 rounded-xl bg-sky-600 py-4"
                onPress={() => navigation.navigate('Convert')}>
                <Text className="text-center text-xl font-medium text-white">Convert</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Conversions */}
            <View className="gap-y-3">
              <Text className="text-lg font-medium text-gray-600">Recent Conversions</Text>
              <View className="border-b border-gray-200 pb-6" style={{ height: containerHeight }}>
                <FlatList
                  data={recentTransactions}
                  keyExtractor={(item) => item.id!}
                  renderItem={({ item }) => (
                    <View className="mb-2">
                      <TxListItem listType="TX" transaction={item} />
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>

            <TouchableOpacity
              className="flex flex-row justify-center"
              onPress={() => navigation.navigate('Conversions')}>
              <Text className="rounded-full border border-sky-600/50 px-4 py-2 font-semibold text-sky-600">
                See All Conversions
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={createWallet} className="rounded-xl bg-blue-600 px-6 py-3">
            <Text className="font-bold text-white">Create Wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    </CoreLayout>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    width: '20.6666667%',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
