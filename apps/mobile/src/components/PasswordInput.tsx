import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

const PasswordInput = (props: TextInputProps) => {
  const { onChangeText, secureTextEntry, ...rest } = props;
  const [readable, setReadable] = useState<boolean>(false);
  return (
    <View className="flex w-full flex-row items-center justify-between gap-3 rounded-lg bg-gray-100">
      <TextInput
        className="w-[85%] p-3 py-4 text-lg font-medium leading-[18px]"
        onChangeText={onChangeText}
        secureTextEntry={!readable}
        {...rest}
      />

      <TouchableOpacity className="mr-3" onPress={() => setReadable(!readable)}>
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
