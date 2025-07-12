import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { PasswordInputProps } from '~/types/inputfields';

const PasswordInput = (props: PasswordInputProps) => {
  const { onChangeText, maxLength, secureTextEntry, showCountdown = false, ...rest } = props;
  const [readable, setReadable] = useState<boolean>(false);
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
    <View className="flex w-full flex-row items-center justify-between gap-3 rounded-lg bg-gray-100">
      <TextInput
        className={`${showCountdown ? 'w-[75%]' : 'w-[85%]'} text- p-3 py-4 font-medium leading-[18px]`}
        onChangeText={handleChangeText}
        secureTextEntry={!readable}
        {...rest}
      />
      {showCountdown && maxLength && (
        <Text className={`w-8 text-right font-semibold ${textColor}`}>{textCounter}</Text>
      )}
      <TouchableOpacity className={`${'mr-3'}`} onPress={() => setReadable(!readable)}>
        <FontAwesome6
          name={readable ? 'eye' : 'eye-slash'}
          size={20}
          color={readable ? '#374151' : '#9ca3af'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
