import { FontAwesome6 } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useAtomValue } from 'jotai';
import LottieView from 'lottie-react-native';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

import { currencyAtom, transactionsAtom } from '~/atoms';
import { LabelFieldWithCopy } from '~/components';
import { useWallet, useXrpPriceMeta } from '~/hooks';
import { CoreLayout } from '~/layouts';
import { RootStackParamList } from '~/types';
import { convertCurrencyAmount, formatFloatClean, formatWithCommas } from '~/utils';

const WalletScreen = () => {
  const { walletAddress, walletBalance, refreshBalance, loading } = useWallet();
  const currency = useAtomValue(currencyAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const recentTransactions = useAtomValue(transactionsAtom).slice(0, 4);

  const {
    price: xrpPriceUSD,
    isFresh,
    isResuming,
    lastUpdated,
    secondsUntilNextUpdate,
  } = useXrpPriceMeta();

  const ITEM_HEIGHT = 80;
  const ITEM_SPACING = 8;
  const VISIBLE_ITEMS = 3;
  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS + ITEM_SPACING * (VISIBLE_ITEMS - 1);

  const balanceAsNumber = parseFloat(walletBalance?.balance.toString() || '0');
  const { usdAmount, xrpAmount } = convertCurrencyAmount({
    amount: balanceAsNumber,
    fromCurrency: 'XRP', // Wallet balance is always in XRP
    xrpPriceUSD,
  });

  const primaryAmount =
    currency === 'USD'
      ? formatWithCommas(formatFloatClean(usdAmount))
      : formatWithCommas(formatFloatClean(xrpAmount));

  const secondaryAmount =
    currency === 'USD'
      ? `${formatWithCommas(formatFloatClean(xrpAmount))} XRP`
      : `$${formatWithCommas(formatFloatClean(usdAmount))}`;

  return (
    <CoreLayout showFooter showHeaderOptions>
      <View className="mx-6 flex-1 items-center justify-center">
        <View className="w-full flex-1 flex-col gap-y-6">
          {/* Balance Header */}
          <View className="flex flex-col gap-y-2">
            {/* Refresher */}
            <View className="mb-2 flex flex-row items-center gap-2">
              <Text className="text-lg font-medium text-slate-500">Balance</Text>
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
            <View className="relative flex-row justify-between rounded-lg border border-gray-200 pb-3 pl-3 pr-20">
              <View className="mt-3 flex gap-1">
                <Text className="font-medium text-slate-500">{`Current Value: ${secondaryAmount} ${currency === 'XRP' ? 'USD' : ''}`}</Text>
                <Text className="font-medium text-slate-500">{`Price Per XRP: $${xrpPriceUSD}`}</Text>
                <Text className="font-medium text-slate-500">{`Last Updated: ${dayjs(lastUpdated).format('M/D/YYYY @ h:mm:ssa')}`}</Text>
              </View>
              <View className="absolute right-0 top-0">
                {isResuming ? (
                  <View className="min-w-20 max-w-32 flex-row items-center justify-center rounded-bl rounded-tr bg-yellow-500 px-2 py-1.5">
                    <LottieView
                      source={require('~/../assets/animations/loading-spinner.json')}
                      autoPlay
                      loop
                      style={{ width: 14, height: 14 }}
                    />
                    <Text
                      allowFontScaling={false}
                      className="ml-1 text-xs font-medium text-yellow-950">
                      Refreshing…
                    </Text>
                  </View>
                ) : (
                  <View
                    className={cn(
                      'min-w-20 max-w-32 flex-row items-center justify-center rounded-bl rounded-tr px-2 py-1.5',
                      {
                        'bg-green-500': isFresh,
                        'bg-red-600': !isFresh && secondsUntilNextUpdate <= 5,
                        'bg-yellow-500': !isFresh && secondsUntilNextUpdate > 5,
                      }
                    )}>
                    <Fontisto
                      name="spinner-refresh"
                      size={14}
                      style={{ marginRight: 4 }}
                      color={isFresh || secondsUntilNextUpdate <= 5 ? 'white' : '#422006'}
                    />
                    <Text
                      allowFontScaling={false}
                      className={cn('w-[36px] text-center text-xs font-medium', {
                        'text-white': isFresh || secondsUntilNextUpdate <= 5,
                        'text-yellow-950': !isFresh && secondsUntilNextUpdate > 5,
                      })}>
                      {`in ${secondsUntilNextUpdate}s`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="h-[1px] border-b border-gray-200 pt-2" />
            <LabelFieldWithCopy
              className="mt-6"
              label="Wallet Address"
              value={walletAddress ?? ''}
              valueKey="wallet"
              copiedMessage="Wallet Address Copied!"
            />
          </View>

          {/* Convert Button */}
          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-sky-600 py-4"
              onPress={() => navigation.navigate('Convert')}>
              <Text className="text-center text-xl font-medium text-white">Convert to USD</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Conversions */}
          <View className="gap-y-1">
            <View className="flex flex-row justify-between border-y border-gray-200 p-2">
              <Text className="text-lg font-medium text-slate-500">Recent Conversions</Text>

              <TouchableOpacity
                className="flex flex-row items-center justify-center gap-2"
                onPress={() => navigation.navigate('Conversions')}>
                <Text className="text-lg font-semibold text-sky-600">See All</Text>
                <FontAwesome6 name="arrow-right-long" size={16} color="#0284c7" />
              </TouchableOpacity>
            </View>
            <View className="" style={{ height: containerHeight }}>
              <FlatList
                data={recentTransactions}
                keyExtractor={(item) => item.id!}
                renderItem={({ item }) => (
                  <View className="mb-2">
                    {/* <TxListItem listType="TX" transaction={item} /> */}
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </View>
    </CoreLayout>
  );
};

export default WalletScreen;
