import { useEffect, useState } from 'react';
import { Animated, Text, Vibration, View } from 'react-native';

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

const useSessionResetCountdown = (txState: string, delaySeconds = 5, onComplete?: () => void) => {
  const [countdown, setCountdown] = useState(delaySeconds);

  useEffect(() => {
    if (txState !== 'success' && txState !== 'fail') return;
    if (countdown === 0) {
      onComplete?.(); // ✅ call before anything else
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [txState, countdown]);

  const CountdownDisplay = () => (
    <View className="mt-2">
      <Text className="text-left text-lg text-stone-900">
        Returning to wallet in {countdown}...
      </Text>
    </View>
  );

  return { countdown, CountdownDisplay };
};

export { buzzAndShake, causeBuzz, shakeAnimation, useSessionResetCountdown };
