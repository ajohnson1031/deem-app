import { Animated, Vibration } from 'react-native';

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

export { buzzAndShake, causeBuzz, shakeAnimation };
