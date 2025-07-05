import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { registerAtom } from '~/atoms';
import PasswordInput from '~/components/PasswordInput';
import { StepOneFormProps } from '~/types/registration';

const StepOneForm = ({ onComplete, onCancel }: StepOneFormProps) => {
  const [userData, setUserData] = useAtom(registerAtom);
  const { name, username, email, phoneNumber, password, avatarUri } = userData;
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUserData({ ...userData, avatarUri: result.assets[0].uri });
    }
  };

  const handleNext = () => {
    setError(null);

    if (!name || !username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    onComplete({
      name,
      username,
      email,
      phoneNumber,
      password,
      avatarUri,
    });
  };

  return (
    <View className="w-full px-6">
      <Text className="mb-6 text-center text-4xl font-medium text-black">{`Create Your\nDeem Account`}</Text>

      {/* Avatar Picker */}
      <TouchableOpacity
        onPress={pickImage}
        className="mb-8 self-center rounded-full border border-gray-300 p-2">
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="h-24 w-24 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="#0284c7 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#0284c7]">
            <Feather name="camera" size={24} color="#0284c7" />
          </View>
        )}
      </TouchableOpacity>

      {/* Input fields */}
      {[
        { placeholder: 'Name', value: name, setter: setUserData, name: 'name' },
        { placeholder: 'Username', value: username, setter: setUserData, name: 'username' },
        { placeholder: 'Email', value: email, setter: setUserData, name: 'email' },
        {
          placeholder: 'Password',
          value: password,
          setter: setUserData,
          secure: true,
          name: 'password',
        },
        {
          placeholder: 'Phone (optional)',
          value: phoneNumber,
          setter: setUserData,
          name: 'phoneNumber',
        },
      ].map((field, idx) => (
        <View key={idx} className="mb-3 w-full rounded-lg bg-gray-100">
          {field.placeholder !== 'Password' ? (
            <TextInput
              className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
              placeholder={field.placeholder}
              placeholderTextColor="#777"
              secureTextEntry={field.secure}
              autoCapitalize="none"
              value={field.value}
              onChangeText={(val) => {
                field.setter({ ...userData, [field.name]: val });
                setError(null);
              }}
            />
          ) : (
            <PasswordInput
              placeholder={field.placeholder}
              placeholderTextColor="#777"
              secureTextEntry={field.secure}
              autoCapitalize="none"
              value={field.value}
              onChangeText={(val) => {
                field.setter({ ...userData, password: val });
                setError(null);
              }}
            />
          )}
        </View>
      ))}

      {error && <Text className="mb-3 text-center text-red-500">{error}</Text>}

      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={onCancel}
          className="mt-4 flex-1 rounded-lg border-2 border-gray-800 py-3">
          <Text className="text-center text-xl font-medium text-gray-800">Back to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} className="mt-4 flex-1 rounded-lg bg-sky-600 py-3">
          <Text className="text-center text-xl font-medium text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepOneForm;
