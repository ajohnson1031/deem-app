// PinOrCodeInputField.tsx
import { useEffect, useRef, useState } from 'react';
import { Animated, TextInput } from 'react-native';

import { Theme } from '~/types';
import { buzzAndShake } from '~/utils/feedback';
import { getStoredPin, PIN_CELL_COUNT } from '~/utils/securePin';

interface PinOrCodeInputFieldProps {
  type: 'PIN' | 'VERIFICATION_CODE';
  onChange?: (pin: string) => void;
  onComplete: () => Promise<void>;
  shakeRef: Animated.Value;
  theme?: Theme;
  cellCount?: number;
  hideFieldValues?: boolean;
}

const PinOrCodeInputField = ({
  type,
  onChange,
  onComplete,
  shakeRef,
  theme = 'DARK',
  cellCount = PIN_CELL_COUNT,
  hideFieldValues = false,
}: PinOrCodeInputFieldProps) => {
  const [valLength, setValLength] = useState<number>(cellCount);
  const [val, setVal] = useState<string[]>(Array(valLength).fill(''));
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const borderColors = {
    focused: theme === 'DARK' ? 'border-gray-800' : 'border-white',
    blurred: theme === 'DARK' ? 'border-gray-400' : 'border-white/70',
  };

  useEffect(() => {
    if (type === 'PIN') {
      getStoredPin().then((pin) => {
        if (pin) {
          setStoredPin(pin);
          setValLength(pin.length);
        }
      });
    }
  }, [type]);

  useEffect(() => {
    const joinedVal = val.join('');
    if (joinedVal.length === valLength) {
      if (type === 'PIN') {
        if (storedPin && joinedVal !== storedPin) {
          buzzAndShake(shakeRef);
          onComplete();
          setVal(Array(valLength).fill(''));
          focusInput(0);
        } else {
          onComplete();
        }
      } else {
        // VERIFICATION_CODE mode: just fire the callback
        onComplete();
      }
    }
  }, [val, valLength, storedPin, type, onComplete, shakeRef]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (!cleanText) return;
    const newVal = [...val];
    newVal[index] = cleanText;
    setVal(newVal);
    onChange?.(newVal.join(''));
    if (index < valLength - 1) focusInput(index + 1);
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === 'Backspace') {
      const newVal = [...val];
      if (val[index]) {
        newVal[index] = '';
        setVal(newVal);
      } else if (index > 0) {
        newVal[index - 1] = '';
        setVal(newVal);
        focusInput(index - 1);
      }
    }
  };

  return (
    <Animated.View className="flex-row gap-2" style={{ transform: [{ translateX: shakeRef }] }}>
      {Array(valLength)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={val[index]}
            secureTextEntry={type === 'PIN' || hideFieldValues}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            className={`h-12 w-12 rounded-lg ${type === 'PIN' ? 'border-b' : 'border'} text-center text-2xl ${
              val[index] ? borderColors.focused : borderColors.blurred
            } ${theme === 'DARK' ? 'text-gray-800' : 'text-white'}`}
            textAlign="center"
            style={{ fontSize: 24, lineHeight: 32 }}
          />
        ))}
    </Animated.View>
  );
};

export default PinOrCodeInputField;
