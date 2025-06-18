import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { TxListItem } from './';

import type { Transaction } from '~/types';

interface SwipeableTransactionRowProps {
  transaction: Transaction;
  onApprove: (tx: Transaction) => void;
  onDeny: (tx: Transaction) => void;
}

const SWIPE_THRESHOLD = 120;
const ROW_HEIGHT = 84;

export default function SwipeableTransactionRow({
  transaction,
  onApprove,
  onDeny,
}: SwipeableTransactionRowProps) {
  const translateX = useSharedValue(0);
  const rowHeight = useSharedValue(ROW_HEIGHT);
  const rowOpacity = useSharedValue(1);
  const [hasSwiped, setHasSwiped] = useState(false);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (!hasSwiped) {
        translateX.value = e.translationX;
      }
    })
    .onEnd(() => {
      if (hasSwiped) return;

      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(setHasSwiped)(true);
        rowOpacity.value = withTiming(0, { duration: 300 });
        rowHeight.value = withTiming(0, { duration: 300 });
        runOnJS(onApprove)(transaction);
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(setHasSwiped)(true);
        rowOpacity.value = withTiming(0, { duration: 300 });
        rowHeight.value = withTiming(0, { duration: 300 });
        runOnJS(onDeny)(transaction);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    height: rowHeight.value,
    opacity: rowOpacity.value,
  }));

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backgroundColorStyle = useAnimatedStyle(() => {
    const bg =
      translateX.value > 10
        ? 'rgba(34,197,94,0.15)' // green
        : translateX.value < -10
          ? 'rgba(239,68,68,0.15)' // red
          : 'transparent';
    return { backgroundColor: bg };
  });

  const approveTextStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 10 ? 1 : 0,
    transform: [{ translateX: withSpring(translateX.value > 0 ? 16 : 0) }],
  }));

  const denyTextStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -10 ? 1 : 0,
    transform: [{ translateX: withSpring(translateX.value < 0 ? -16 : 0) }],
  }));

  return (
    <Animated.View style={[containerStyle, styles.overflowHidden]}>
      <Animated.View style={[styles.background, backgroundColorStyle]}>
        <Animated.Text style={[styles.backgroundLabel, styles.approveText, approveTextStyle]}>
          Approving...
        </Animated.Text>
        <Animated.Text style={[styles.backgroundLabel, styles.denyText, denyTextStyle]}>
          Declining...
        </Animated.Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[animatedRowStyle]}>
          <TxListItem type="TX" transaction={transaction} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overflowHidden: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  backgroundLabel: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  approveText: {
    left: 16,
    color: '#00A63E', // green-500
  },
  denyText: {
    right: 16,
    color: '#E7000B', // red-500
  },
});
