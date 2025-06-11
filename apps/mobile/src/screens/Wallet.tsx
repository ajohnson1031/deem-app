import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

import { currencyAtom } from '~/atoms/wallet';
import { ApprovedCurrency } from '~/constants';
import { useWallet } from '~/hooks/useWallet';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types/navigation';
import { useCopyToClipboard } from '~/utils';

const WalletScreen = ({ onLogout }: { onLogout: () => void }) => {
  const { walletAddress, walletBalance, createWallet, refreshBalance, loading } = useWallet();
  const [currency, setCurrency] = useAtom(currencyAtom);
  const { copied, copy } = useCopyToClipboard();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currencyOptions] = useState<Record<string, ApprovedCurrency>[]>([
    { label: 'XRP', value: 'XRP' },
    { label: 'USD', value: 'USD' },
  ]);

  return (
    <CoreLayout showFooter showBack={false}>
      <View className="m-6 flex-1 items-center justify-center">
        {walletAddress ? (
          <View className="w-full flex-1 flex-col gap-y-6">
            {/* Balance, Currency Functionality */}
            <View className="flex flex-col gap-y-2">
              {/* Balance Refresher */}
              <View className="mb-2 flex flex-row items-center gap-2">
                <Text className="text-lg font-medium text-gray-600">Balance</Text>
                <TouchableOpacity onPress={refreshBalance}>
                  <Fontisto name="spinner-refresh" size={20} color="#4b5563" />
                </TouchableOpacity>
              </View>
              {/* // TODO: font size switching based on text length */}
              {/* Balance Display */}
              <View className="flex flex-row items-baseline">
                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  visible={!loading}
                  style={{ height: 80, width: 'fit-content', borderRadius: 8 }}>
                  <Text className="text-8xl font-semibold">{walletBalance?.balance}</Text>
                </ShimmerPlaceHolder>

                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  visible={!loading}
                  style={{ height: 30, width: 50, borderRadius: 4 }}>
                  <Text className="text-xl font-semibold">{currency}</Text>
                </ShimmerPlaceHolder>
              </View>

              {/* Wallet Copy, Currency Switcher */}
              <View className="flex flex-row gap-4">
                <View className="flex w-9/12 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-200 py-4">
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

            {/* Send Button */}
            <TouchableOpacity
              className="rounded-xl bg-sky-600 py-4"
              onPress={() => navigation.navigate('Send')}>
              <Text className="text-center text-lg font-semibold text-white">Send Payment</Text>
            </TouchableOpacity>

            {/* // TODO: Move this behind a security screen */}
            {/* <WalletDetails
              address={walletAddress}
              publicKey={wallet!.publicKey}
              seed={wallet!.seed}
            /> */}

            {/* // TODO: Let's put this behind another layer of functionality as a later enhancement (i.e., Wallet Swapping) */}
            {/* <TouchableOpacity onPress={createWallet} className="rounded-xl bg-sky-700 px-4 py-2">
            <Text className="font-bold text-white">Regenerate Wallet</Text>
          </TouchableOpacity> */}

            {/* // TODO: Move this to the settings page */}
            {/* <TouchableOpacity onPress={onLogout} className="mt-8 rounded bg-sky-700 px-6 py-3">
              <Text className="font-bold text-white">Logout</Text>
            </TouchableOpacity> */}
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
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
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
    fontWeight: 500,
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
