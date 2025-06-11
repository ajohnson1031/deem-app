import { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components';
import PinInputField from '~/components/PinInputField';
import { buzzAndShake } from '~/utils/feedback';

type PinSetupScreenProps = {
  onComplete: (pin: string) => void;
  errorMessage?: string | null;
};

export default function PinSetupScreen({ onComplete, errorMessage }: PinSetupScreenProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [tempPin, setTempPin] = useState('');
  const shakeRef = useRef(new Animated.Value(0)).current;

  const handlePinChange = (value: string) => {
    setTempPin(value);
    setLocalError(null);
  };

  const handlePinComplete = async () => {
    if (tempPin.length < 4) {
      setLocalError('PIN must be 4 - 6 digits');
      buzzAndShake(shakeRef);
      return;
    }
    onComplete(tempPin);
  };

  return (
    <Container>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-lg">Set a 4 Digit PIN</Text>

        <PinInputField
          onPinChange={handlePinChange}
          onPinComplete={handlePinComplete}
          shakeRef={shakeRef}
        />

        <TouchableOpacity
          onPress={handlePinComplete}
          className="mt-6 rounded bg-blue-600 px-6 py-3">
          <Text className="font-bold text-white">Save PIN</Text>
        </TouchableOpacity>

        {(errorMessage || localError) && (
          <Text className="mt-4 font-medium text-sky-700">{errorMessage || localError}</Text>
        )}
      </View>
    </Container>
  );
}
