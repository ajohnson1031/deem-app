import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Container } from '~/components';
import { getStoredPin } from '~/utils';

type PinEntryScreenProps = {
  onSuccess: () => void;
};

export default function PinEntryScreen({ onSuccess }: PinEntryScreenProps) {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (pin.length < 4) {
      setErrorMessage('PIN must be at least 4 digits');
      return;
    }

    const storedPin = await getStoredPin();
    if (pin === storedPin) {
      setErrorMessage(null);
      onSuccess();
    } else {
      setErrorMessage('Incorrect PIN');
    }
  };

  const handleChange = (text: string) => {
    setPin(text);
    setErrorMessage(null);
  };

  return (
    <Container>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-lg">Enter Your PIN</Text>
        <TextInput
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          className="w-full rounded border p-4"
          value={pin}
          onChangeText={handleChange}
        />
        <TouchableOpacity onPress={handleVerify} className="mt-6 rounded bg-blue-600 px-6 py-3">
          <Text className="font-bold text-white">Login</Text>
        </TouchableOpacity>
        {errorMessage && <Text className="mt-4 font-medium text-red-500">{errorMessage}</Text>}
      </View>
    </Container>
  );
}
