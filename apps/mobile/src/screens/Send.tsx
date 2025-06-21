import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';

import { currencyAtom, currentTxAtom, txSessionAuthorizedAtom, xrpPriceAtom } from '~/atoms';
import { useWallet } from '~/hooks/useWallet';
import CoreLayout from '~/layouts/CoreLayout';
import PinEntryScreen from '~/screens/PinEntry';
import { ApprovedCurrency, RootStackParamList, TxType } from '~/types';
import {
  buzzAndShake,
  convertCurrencyAmount,
  formatFloatClean,
  formatWithCommas,
  getStoredPin,
} from '~/utils';

const SendScreen = () => {
  const [checking, setChecking] = useState(true);
  const [fallbackToPin, setFallbackToPin] = useState<null | boolean>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txAuthorized, setTxAuthorized] = useAtom(txSessionAuthorizedAtom);
  const [tx, setTx] = useAtom(currentTxAtom);
  const [currency, setCurrency] = useAtom(currencyAtom);
  const xrpPriceUSD = useAtomValue(xrpPriceAtom);
  const parsedAmount = parseFloat(tx.amount || '0');

  const converted = convertCurrencyAmount({
    amount: parsedAmount,
    fromCurrency: currency,
    xrpPriceUSD,
  });

  const { walletBalance } = useWallet();
  const [currencyOptions] = useState<Record<string, ApprovedCurrency>[]>([
    { label: 'XRP', value: 'XRP' },
    { label: 'USD', value: 'USD' },
  ]);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [whole, decimal = ''] = (tx.amount || '').split('.');
  const isDisabled =
    !tx.amount || (whole === '0' && parseInt(decimal, 10) === 0) || (whole === '0' && !decimal);

  useEffect(() => {
    const checkAndAuthenticate = async () => {
      if (txAuthorized) {
        setChecking(false);
        return;
      }

      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authorize Transaction',
            fallbackLabel: 'Use PIN instead',
          });

          if (result.success) {
            setTxAuthorized(true);
            return;
          }
        }

        const storedPin = await getStoredPin();
        if (storedPin) {
          setFallbackToPin(true);
        } else {
          setErrorMessage('No authentication method available.');
        }
      } catch (err) {
        setErrorMessage((err as Error).message);
      } finally {
        setChecking(false);
      }
    };

    checkAndAuthenticate();
  }, [txAuthorized]);

  const handleNumberPress = (num: string) => {
    const { amount, timestamps } = tx;

    if (amount === '0' && num === '.') {
      setTx({
        ...tx,
        amount: '0.',
        timestamps: {
          ...timestamps,
          draftedAt: timestamps?.draftedAt ?? Date.now(),
        },
      });
      return;
    }

    if (num === '.' && amount!.includes('.')) {
      return buzzAndShake(shakeAnim);
    }

    if (amount === '0' && num !== '.') {
      setTx({
        ...tx,
        amount: num,
        timestamps: {
          ...timestamps,
          draftedAt: timestamps?.draftedAt ?? Date.now(),
        },
      });
      return;
    }

    const [, decimal] = amount!.split('.');
    const hasDecimal = amount!.includes('.');
    const maxWhole = 10;
    const maxDecimal = 2;
    const maxLength = hasDecimal ? maxWhole + maxDecimal + 1 : maxWhole;

    if ((hasDecimal && decimal?.length >= maxDecimal) || amount!.length >= maxLength) {
      return buzzAndShake(shakeAnim);
    }

    const next = amount + num;
    setTx({
      ...tx,
      amount: next,
      timestamps: {
        ...timestamps,
        draftedAt: timestamps?.draftedAt ?? Date.now(),
      },
    });
  };

  const handleBackspace = () => {
    const { amount, timestamps } = tx;
    if (!amount || amount === '0') return buzzAndShake(shakeAnim);
    const next = amount.length <= 1 ? '0' : amount.slice(0, -1);
    const shouldResetDraftedAt = next === '0';

    setTx({
      ...tx,
      amount: next,
      timestamps: shouldResetDraftedAt ? undefined : timestamps,
    });
  };

  const handleRequestPress = (type: TxType) => {
    Toast.hide();

    if (isDisabled) return;

    if (type === 'PAYMENT' && parseFloat(tx.amount) > Number(walletBalance?.balance)) {
      buzzAndShake(shakeAnim);
      Toast.show({
        type: 'error',
        text1: `Invalid Transaction Request`,
        text2: `Tx amount exceeds wallet balance`,
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setTx({
      ...tx,
      type,
      direction: type === 'PAYMENT' ? 'OUTGOING' : 'INCOMING',
      status: 'PENDING',
      timestamps: {
        ...tx.timestamps,
        createdAt: Date.now(),
      },
    });

    navigation.navigate('Contacts');
  };

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600">Verifying identity...</Text>
        {errorMessage && <Text className="mt-2 text-red-600">{errorMessage}</Text>}
      </View>
    );
  }

  if (fallbackToPin) {
    return (
      <PinEntryScreen
        onSuccess={() => {
          setFallbackToPin(false);
          setTxAuthorized(true);
        }}
      />
    );
  }

  if (!txAuthorized) {
    return null;
  }

  return (
    <CoreLayout showFooter showHeaderOptions>
      <View className="flex-1 px-4 pb-20">
        <Animated.View
          style={{ transform: [{ translateX: shakeAnim }] }}
          className="flex-1 items-center justify-center">
          <View className={cn('h-25 flex flex-row items-baseline', { 'mb-6': parsedAmount === 0 })}>
            {currency === 'USD' && (
              <Text
                className={cn('text-center font-inter-medium text-5xl', {
                  '!text-3xl': tx.amount!.length > 5 && tx.amount!.length <= 9,
                  '!text-xl': tx.amount!.length > 8,
                })}>
                $
              </Text>
            )}
            <Text
              className={cn('text-center font-inter-medium text-8xl', {
                '!text-6xl': tx.amount!.length > 5 && tx.amount!.length <= 9,
                '!text-4xl': tx.amount!.length > 8,
              })}>
              {formatWithCommas(formatFloatClean(parsedAmount))}
            </Text>
            {currency === 'XRP' && <Text className="text-xl font-semibold">{currency}</Text>}
          </View>

          {parsedAmount > 0 && xrpPriceUSD > 0 && (
            <Text className="mb-8 text-lg font-medium text-gray-500">
              {currency === 'USD'
                ? `${formatWithCommas(formatFloatClean(converted.xrpAmount))} XRP`
                : `$${formatWithCommas(formatFloatClean(converted.usdAmount))}`}
            </Text>
          )}

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
              const newCurrency = item.value as ApprovedCurrency;

              const amountNumber = parseFloat(tx.amount || '0');
              if (isNaN(amountNumber) || amountNumber === 0 || !xrpPriceUSD) {
                setCurrency(newCurrency);
                setTx((prev) => ({ ...prev, currency: newCurrency }));
                return;
              }

              const { usdAmount, xrpAmount } = convertCurrencyAmount({
                amount: amountNumber,
                fromCurrency: currency,
                xrpPriceUSD,
              });

              const newAmount = newCurrency === 'USD' ? usdAmount.toFixed(2) : xrpAmount.toFixed(6);

              setCurrency(newCurrency);

              setTx((prev) => ({
                ...prev,
                amount: newAmount,
                currency: newCurrency,
                originalAmount: prev.originalAmount ? newAmount : undefined,
              }));
            }}
          />

          <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num)}
                className="w-[30%] rounded px-6 py-4">
                <Text className="text-center text-2xl font-semibold">{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={handleBackspace} className="w-[30%] rounded px-6 py-4">
              <Ionicons name="backspace-outline" size={28} style={{ textAlign: 'center' }} />
            </TouchableOpacity>
          </View>

          <View className="mt-8 flex w-full flex-row justify-center gap-x-4">
            <TouchableOpacity
              className={cn('w-[42.5%] rounded-xl bg-sky-600  py-4', {
                'opacity-40': isDisabled,
              })}
              disabled={isDisabled}
              onPress={() => handleRequestPress('REQUEST')}>
              <Text className="text-center text-xl font-medium text-white">Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={cn('w-[42.5%] rounded-xl bg-green-600  py-4', {
                'opacity-40': isDisabled,
              })}
              disabled={isDisabled}
              onPress={() => handleRequestPress('PAYMENT')}>
              <Text className="text-center text-xl font-medium text-white">Pay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </CoreLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    width: '25%',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
    marginTop: -16,
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
    height: 25,
    fontSize: 16,
  },
});

export default SendScreen;
