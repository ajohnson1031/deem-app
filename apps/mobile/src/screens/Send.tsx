import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { txSessionAuthorizedAtom } from '~/atoms/session';
import { currentTxAtom, TxType } from '~/atoms/transaction';
import { useWallet } from '~/hooks/useWallet';
import CoreLayout from '~/layouts/CoreLayout';
import PinEntryScreen from '~/screens/PinEntry';
import { RootStackParamList } from '~/types/navigation';
import { buzzAndShake, formatWithCommas, getStoredPin } from '~/utils';

export default function SendScreen() {
  const [checking, setChecking] = useState(true);
  const [fallbackToPin, setFallbackToPin] = useState<null | boolean>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txAuthorized, setTxAuthorized] = useAtom(txSessionAuthorizedAtom);
  const [tx, setTx] = useAtom(currentTxAtom);
  const { walletBalance } = useWallet();

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [whole, decimal] = tx.amount.split('.');
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
    const { amount } = tx;

    if (amount === '0' && num === '.') {
      setTx({ ...tx, amount: '0.' });
      return;
    }

    if (num === '.' && amount!.includes('.')) {
      return buzzAndShake(shakeAnim);
    }

    if (amount === '0' && num !== '.') {
      setTx({ ...tx, amount: num });
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
    setTx({ ...tx, amount: next });
  };

  const handleBackspace = () => {
    const { amount } = tx;
    if (!amount || amount === '0') return buzzAndShake(shakeAnim);
    const next = amount.length <= 1 ? '0' : amount.slice(0, -1);
    setTx({ ...tx, amount: next });
  };

  const handleRequestPress = (type: TxType) => {
    Toast.hide();

    if (isDisabled) return;
    console.log(type, parseFloat(tx.amount), walletBalance?.balance);
    if (type === 'PAY' && parseFloat(tx.amount) > Number(walletBalance?.balance)) {
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

    setTx({ ...tx, type });
    navigation.navigate('Contacts');
  };

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600">Verifying identity...</Text>
        {errorMessage && <Text className="mt-2 text-red-500">{errorMessage}</Text>}
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
    <CoreLayout showFooter showHeaderOptions showBack={false}>
      <View className="flex-1 px-4 pb-20">
        <Animated.View
          style={{ transform: [{ translateX: shakeAnim }] }}
          className="flex-1 items-center justify-center">
          <View className="flex h-32 flex-row items-baseline">
            <Text
              className={cn('font-inter-medium mb-6 text-center text-8xl', {
                '!text-6xl': tx.amount!.length > 5 && tx.amount!.length <= 9,
                '!text-4xl': tx.amount!.length > 8,
              })}>
              {formatWithCommas(tx.amount! || '0')}
            </Text>
            <Text className="text-xl font-semibold">XRP</Text>
          </View>

          {/* TODO: Add USD Value, Ratio, Polling */}

          <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num)}
                className="w-[30%] rounded px-6 py-4">
                <Text className="text-center text-xl font-bold">{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={handleBackspace} className="w-[30%] rounded px-6 py-4">
              <Ionicons name="backspace-outline" size={24} style={{ textAlign: 'center' }} />
            </TouchableOpacity>
          </View>

          <View className="mt-8 flex w-full flex-row justify-center gap-x-4">
            <TouchableOpacity
              className={cn('w-[42.5%] rounded-full bg-red-500  py-4', {
                'opacity-40': isDisabled,
              })}
              disabled={isDisabled}
              onPress={() => handleRequestPress('REQUEST')}>
              <Text className="text-center text-lg font-semibold text-white">Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={cn('w-[42.5%] rounded-full bg-green-500  py-4', {
                'opacity-40': isDisabled,
              })}
              disabled={isDisabled}
              onPress={() => handleRequestPress('PAY')}>
              <Text className="text-center text-lg font-semibold text-white">Pay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </CoreLayout>
  );
}
