import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Container } from '~/components';

type PinSetupScreenProps = {
  onComplete: (pin: string) => void;
  errorMessage?: string | null;
};

export default function PinSetupScreen({ onComplete, errorMessage }: PinSetupScreenProps) {
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSave = () => {
    if (pin.length < 4 || pin.length > 6) {
      setLocalError('PIN must be 4 - 6 characters in length');
    } else {
      setLocalError(null);
      onComplete(pin);
    }
  };

  const handleChange = (text: string) => {
    setPin(text);
    setLocalError(null);
  };

  return (
    <Container>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-lg">Set a 4–6 Digit PIN</Text>
        <TextInput
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          className="w-full rounded border p-4"
          value={pin}
          onChangeText={handleChange}
        />
        <TouchableOpacity onPress={handleSave} className="mt-6 rounded bg-blue-600 px-6 py-3">
          <Text className="font-bold text-white">Save PIN</Text>
        </TouchableOpacity>
        {(errorMessage || localError) && (
          <Text className="mt-4 font-medium text-red-500">{errorMessage || localError}</Text>
        )}
      </View>
    </Container>
  );
}
