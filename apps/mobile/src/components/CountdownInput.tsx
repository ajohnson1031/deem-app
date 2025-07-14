import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CountdownInputProps, FieldVariant } from '~/types/inputfields';

const CountdownInput = (props: CountdownInputProps) => {
  const { onChangeText, maxLength, className, textClassName, variant, secureTextEntry, ...rest } =
    props;
  const [masked, setMasked] = useState<boolean>(variant === FieldVariant.MASKED);
  console.log(variant, masked);
  const [textCounter, setTextCounter] = useState<number | null>(null);

  const handleChangeText = (text: string) => {
    if (maxLength && text.length) {
      setTextCounter(maxLength - text.length);
    }

    if (text.length === 0) {
      setTextCounter(null);
    }
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const textColor =
    typeof textCounter === 'number' && textCounter <= 5 ? 'text-red-500' : 'text-slate-500';

  return (
    <View
      className={`flex w-full flex-row items-center justify-between gap-3 rounded-lg bg-gray-100 ${className}`}>
      <TextInput
        secureTextEntry={masked}
        onChangeText={handleChangeText}
        className={`flex items-center px-3 py-4 text-xl font-medium leading-[20px] ${textClassName} ${variant === FieldVariant.MASKED ? 'w-[75%]' : 'w-[85%]'}`}
        {...rest}
      />
      <Text
        className={`font-semibold ${textColor} ${variant === FieldVariant.MASKED ? 'mr-0' : 'mr-3'}`}>
        {textCounter}
      </Text>
      {variant === FieldVariant.MASKED && (
        <TouchableOpacity className={`${'mr-3'}`} onPress={() => setMasked(!masked)}>
          <FontAwesome6
            name={masked ? 'eye' : 'eye-slash'}
            size={20}
            color={masked ? '#374151' : '#9ca3af'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CountdownInput;
