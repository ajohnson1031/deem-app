import { FontAwesome6 } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useAtomValue } from 'jotai';
import LottieView from 'lottie-react-native';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown'; // TODO: Integrate when ready
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

import { currencyAtom, transactionsAtom } from '~/atoms';
import { useCopyToClipboard, useWallet, useXrpPriceMeta } from '~/hooks';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types';
import { convertCurrencyAmount, formatFloatClean, formatWithCommas } from '~/utils';

const WalletScreen = () => {
  const { walletAddress, walletBalance, refreshBalance, loading } = useWallet();
  // const [currency, setCurrency] = useAtom(currencyAtom); // TODO: Setter related to currency switcher
  const currency = useAtomValue(currencyAtom);
  const { copiedKey, copy } = useCopyToClipboard();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const recentTransactions = useAtomValue(transactionsAtom).slice(0, 4);

  const {
    price: xrpPriceUSD,
    isFresh,
    isResuming,
    lastUpdated,
    secondsUntilNextUpdate,
  } = useXrpPriceMeta();

  // const [currencyOptions] = useState<Record<string, ApprovedCurrency>[]>([ // TODO: Related to currency switcher
  //   { label: 'XRP', value: 'XRP' },
  //   { label: 'USD', value: 'USD' },
  // ]);

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
    <CoreLayout showBack showFooter showHeaderOptions>
      <View className="mx-6 flex-1 items-center justify-center">
        <View className="w-full flex-1 flex-col gap-y-6">
          {/* Balance Header */}
          <View className="flex flex-col gap-y-2">
            {/* Refresher */}
            <View className="mb-2 flex flex-row items-center gap-2">
              <Text className="text-lg font-medium text-gray-500">Balance</Text>
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
            <View className="flex-row justify-between rounded-lg border border-gray-200 pb-3 pl-3">
              <View className="mt-3 flex gap-1">
                <Text className="font-medium text-gray-500">{`Current Value: ${secondaryAmount} ${currency === 'XRP' ? 'USD' : ''}`}</Text>
                <Text className="font-medium text-gray-500">{`Price Per XRP: $${xrpPriceUSD}`}</Text>
                <Text className="font-medium text-gray-500">{`Last Updated: ${dayjs(lastUpdated).format('MMMM D, YYYY @ h:mm:ssa')}`}</Text>
              </View>
              <View>
                {isResuming ? (
                  <View className="w-28 flex-row items-center justify-center rounded-bl rounded-tr bg-yellow-500 py-1.5">
                    <LottieView
                      source={require('~/../assets/animations/loading-spinner.json')}
                      autoPlay
                      loop
                      style={{ width: 14, height: 14 }}
                    />
                    <Text className="ml-1 text-xs font-medium text-yellow-950">Refreshing…</Text>
                  </View>
                ) : (
                  <View
                    className={`w-20 flex-row items-center justify-center rounded-bl rounded-tr py-1.5 ${
                      isFresh
                        ? 'bg-green-500'
                        : secondsUntilNextUpdate <= 5
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                    }`}>
                    <Fontisto
                      name="spinner-refresh"
                      size={14}
                      style={{ marginRight: 4 }}
                      color={isFresh || secondsUntilNextUpdate <= 5 ? 'white' : '#422006'}
                    />

                    <Text
                      className={`w-[36px] text-center text-xs font-medium ${
                        isFresh || secondsUntilNextUpdate <= 5 ? 'text-white' : 'text-yellow-950'
                      }`}>
                      {`in ${secondsUntilNextUpdate}s`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="h-[1px] border-b border-gray-200 pt-2" />
            {/* Wallet address + currency switch */}
            <View className="mt-6 flex-row gap-4">
              <Text className="absolute -top-3 left-3 z-10 rounded-md bg-white px-2 pb-0.5 text-sm font-semibold text-gray-500">
                Wallet Address
              </Text>
              <View className="w-full flex-row items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 py-4">
                <Text
                  className="m-0 flex-1 px-4 py-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ fontWeight: 500, color: copiedKey ? '#0284c7' : '#4B5563' }}>
                  {copiedKey ? 'Wallet Address Copied!' : walletAddress}
                </Text>

                <TouchableOpacity
                  className="px-4"
                  disabled={!walletAddress}
                  onPress={() => copy(walletAddress ?? '', 'wallet')}>
                  <Feather name="copy" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              {/* // TODO: Integrate switcher when ready to custody other assets in app; For now we'll just display currency equivalencies */}
              {/* <Dropdown
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
              /> */}
            </View>
          </View>

          {/* Convert Button */}
          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-sky-600 py-4"
              onPress={() => navigation.navigate('Convert')}>
              <Text className="text-center text-xl font-medium text-white">Convert Currency</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Conversions */}
          <View className="gap-y-1">
            <View className="flex flex-row justify-between border-y border-gray-200 p-2">
              <Text className="text-lg font-medium text-gray-500">Recent Conversions</Text>

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

// const styles = StyleSheet.create({ // TODO: Related to currency switcher
//   container: {
//     backgroundColor: 'white',
//     padding: 16,
//   },
//   dropdown: {
//     width: '20.6666667%',
//     backgroundColor: '#f3f4f6',
//     borderColor: '#e5e7eb',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 16,
//   },
//   icon: {
//     marginRight: 5,
//   },
//   label: {
//     position: 'absolute',
//     backgroundColor: 'white',
//     left: 22,
//     top: 8,
//     zIndex: 999,
//     paddingHorizontal: 8,
//     fontSize: 14,
//     color: '#4B5563',
//   },
//   placeholderStyle: {
//     fontSize: 16,
//   },
//   selectedTextStyle: {
//     fontSize: 16,
//     color: '#4B5563',
//     fontWeight: '500',
//   },
//   iconStyle: {
//     width: 20,
//     height: 20,
//   },
//   inputSearchStyle: {
//     height: 40,
//     fontSize: 16,
//   },
// });
