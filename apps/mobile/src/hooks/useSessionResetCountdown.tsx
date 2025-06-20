import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

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

export { useSessionResetCountdown };
