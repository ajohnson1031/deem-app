import { useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { Container } from '~/components';
import PinOrCodeInputField from '~/components/PinOrCodeInputField';
import { getStoredPin } from '~/utils/securePin';

type PinEntryScreenProps = {
  onSuccess: () => void;
};

export default function PinEntryScreen({ onSuccess }: PinEntryScreenProps) {
  const [tempPin, setTempPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const shakeRef = useRef(new Animated.Value(0)).current;

  const handlePinChange = (value: string) => {
    setTempPin(value);
    setErrorMessage(null);
  };

  const handlePinComplete = async () => {
    const storedPin = await getStoredPin();
    if (tempPin === storedPin) {
      setErrorMessage(null);
      onSuccess();
    } else {
      setErrorMessage('Incorrect PIN');
    }
  };

  return (
    <Container>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-2xl">Enter PIN</Text>

        <PinOrCodeInputField
          type="PIN"
          onChange={handlePinChange}
          onComplete={handlePinComplete}
          shakeRef={shakeRef}
        />

        {errorMessage && <Text className="mt-4 font-medium text-red-600">{errorMessage}</Text>}
      </View>
    </Container>
  );
}
