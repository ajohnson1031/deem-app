// PinInputField.tsx
import { useEffect, useRef, useState } from 'react';
import { Animated, TextInput } from 'react-native';

import { buzzAndShake } from '~/utils/feedback';
import { getStoredPin, PIN_CELL_COUNT } from '~/utils/securePin';

interface PinInputFieldProps {
  onPinChange?: (pin: string) => void;
  onPinComplete: () => Promise<void>;
  shakeRef: Animated.Value;
}

const PinInputField = ({ onPinChange, onPinComplete, shakeRef }: PinInputFieldProps) => {
  const [pinLength, setPinLength] = useState<number>(PIN_CELL_COUNT);
  const [pin, setPin] = useState<string[]>(Array(pinLength).fill(''));
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    getStoredPin().then((pin) => {
      if (pin) {
        setStoredPin(pin);
        setPinLength(pin.length);
      }
    });
  }, []);

  useEffect(() => {
    const joinedPin = pin.join('');
    if (joinedPin.length === pinLength && storedPin !== null) {
      if (joinedPin !== storedPin) {
        buzzAndShake(shakeRef);
        onPinComplete();
        setPin(Array(pinLength).fill(''));
        focusInput(0);
      } else {
        onPinComplete();
      }
    }
  }, [pin]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (!cleanText) return;
    const newPin = [...pin];
    newPin[index] = cleanText;
    setPin(newPin);
    onPinChange?.(newPin.join(''));
    if (index < pinLength - 1) focusInput(index + 1);
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === 'Backspace') {
      const newPin = [...pin];
      if (pin[index]) {
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        newPin[index - 1] = '';
        setPin(newPin);
        focusInput(index - 1);
      }
    }
  };

  return (
    <Animated.View className="flex-row gap-2" style={{ transform: [{ translateX: shakeRef }] }}>
      {Array(pinLength)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={pin[index] ? '•' : ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            className={`h-12 w-12 rounded-lg border-b text-center text-2xl ${
              pin[index] ? 'border-gray-800' : 'border-gray-400'
            }`}
            textAlign="center"
            style={{ fontSize: 24, lineHeight: 32 }}
          />
        ))}
    </Animated.View>
  );
};

export default PinInputField;
