import { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

const CountdownInput = (props: TextInputProps) => {
  const { onChangeText, maxLength, className, ...rest } = props;
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
        className="w-[85%] p-3 py-4 text-lg font-medium leading-[18px]"
        {...rest}
      />
      <Text className={`mr-3 font-semibold ${textColor}`}>{textCounter}</Text>
    </View>
  );
};

export default CountdownInput;
