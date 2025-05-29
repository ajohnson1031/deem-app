import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Animated, Text, Vibration, View } from 'react-native';

import { txSessionAuthorizedAtom } from '~/atoms/session';
import { RootStackParamList } from '~/types/navigation';

const causeBuzz = () => {
  Vibration.vibrate(250);
};

const shakeAnimation = (ref: Animated.Value) => {
  Animated.sequence([
    Animated.timing(ref, { toValue: 5, duration: 20, useNativeDriver: true }),
    Animated.timing(ref, { toValue: -5, duration: 20, useNativeDriver: true }),
    Animated.timing(ref, { toValue: 5, duration: 20, useNativeDriver: true }),
    Animated.timing(ref, { toValue: 0, duration: 20, useNativeDriver: true }),
  ]).start();
};

const buzzAndShake = (ref: Animated.Value) => {
  causeBuzz();
  shakeAnimation(ref);
};

const useSessionResetCountdown = (txState: string, delaySeconds: number = 5) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setTxAuthorized = useSetAtom(txSessionAuthorizedAtom);
  const [countdown, setCountdown] = useState(delaySeconds);

  useEffect(() => {
    if (txState !== 'success' && txState !== 'fail') return;
    if (countdown === 0) {
      setTxAuthorized(false);
      navigation.navigate('Contacts');
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [txState, countdown]);

  const CountdownDisplay = () => (
    <View className="mt-6 items-center">
      <Text className="text-sm text-gray-600">Resetting in {countdown}...</Text>
    </View>
  );

  return { countdown, CountdownDisplay };
};

export { buzzAndShake, causeBuzz, shakeAnimation, useSessionResetCountdown };
