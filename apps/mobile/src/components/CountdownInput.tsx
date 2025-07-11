import { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface CountdownInputProps extends TextInputProps {
  textClassName?: string;
}

const CountdownInput = (props: CountdownInputProps) => {
  const { onChangeText, maxLength, className, textClassName, ...rest } = props;
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
    typeof textCounter === 'number' && textCounter <= 5 ? 'text-red-500' : 'text-gray-500';

  return (
    <View
      className={`flex w-full flex-row items-center justify-between gap-3 rounded-lg bg-gray-100 ${className}`}>
      <TextInput
        onChangeText={handleChangeText}
        className={`flex w-[85%] items-center px-3 py-4 text-xl font-medium leading-[20px] ${textClassName}`}
        {...rest}
      />
      <Text className={`mr-3 font-semibold ${textColor}`}>{textCounter}</Text>
    </View>
  );
};

export default CountdownInput;
