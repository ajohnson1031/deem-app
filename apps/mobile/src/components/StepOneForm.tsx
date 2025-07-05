import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { registerAtom, usernameAvailabilityAtom } from '~/atoms';
import PasswordInput from '~/components/PasswordInput';
import { useUsernameChecker } from '~/hooks';
import { StepOneFormProps, UserDataKey } from '~/types';

const StepOneForm = ({ onComplete, onCancel }: StepOneFormProps) => {
  const [userData, setUserData] = useAtom(registerAtom);
  const { name, username, email, phoneNumber, password, avatarUri } = userData;
  const [error, setError] = useState<string | null>(null);
  const usernameCheck = useUsernameChecker();
  const availability = useAtomValue(usernameAvailabilityAtom);

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

  const FIELDS: {
    placeholder: string;
    name: UserDataKey;
    value: string;
    matches: RegExp;
    errorMessage: string;
    secure?: boolean;
  }[] = [
    {
      placeholder: 'Name',
      value: name,
      name: 'name',
      matches: /^[A-Za-z\s]+$/, // only letters and spaces
      errorMessage: 'Name may contain letters and spaces only.',
    },
    {
      placeholder: 'Username',
      value: username,
      name: 'username',
      matches: /^[a-zA-Z0-9_]{6,21}$/,
      errorMessage:
        'Username must be between 6 and 21 characters in length and may contain letters, numbers & underscores only.',
    },
    {
      placeholder: 'Email',
      value: email,
      name: 'email',
      matches: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simple email regex
      errorMessage: 'Enter a valid email address.',
    },
    {
      placeholder: 'Password',
      value: password,
      name: 'password',
      secure: true,
      matches: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s@]).{8,}$/, // strong password, excludes @
      errorMessage:
        'Password must be 8+ chars and include uppercase, lowercase, number, and special character (not @).',
    },
    {
      placeholder: 'Phone (optional)',
      value: phoneNumber,
      name: 'phoneNumber',
      matches: /^\+?[0-9\s\-()]{7,20}$/, // flexible phone format
      errorMessage: 'Enter a valid phone number.',
    },
  ];

  const hasValidationErrors = FIELDS.some((field) => {
    const value = userData[field.name];

    // Skip phone if it's optional and empty
    if (field.name === 'phoneNumber' && !value) return false;

    return !field.matches.test(value?.trim() || '');
  });

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

      <View className="flex">
        {/* Input fields */}
        {FIELDS.map((field, idx) => {
          const isValid = !field.value || field.matches.test(field.value); // only validate if value is non-empty
          const showError = field.value && !isValid;

          return (
            <View>
              {field.name === 'username' && field.value.length >= 6 && (
                <View
                  className={`mb-1 self-start rounded-lg px-2 py-1 text-sm ${
                    availability.available ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                  {availability.checking && <Text className="text-gray-500">Checking...</Text>}
                  {availability.available === true && (
                    <View className="flex flex-row items-center gap-1.5">
                      <Feather name="check-circle" size={14} color="#15803d" />
                      <Text className="text-green-600">Username is available</Text>
                    </View>
                  )}
                  {availability.available === false && (
                    <View className="flex flex-row items-center gap-1.5">
                      <Feather name="x" size={14} color="#b91c1c" />
                      <Text className="text-red-600">Username is taken</Text>
                    </View>
                  )}
                </View>
              )}
              <View key={idx} className="mb-2 w-full rounded-lg bg-gray-100">
                {field.placeholder !== 'Password' ? (
                  <TextInput
                    className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
                    placeholder={field.placeholder}
                    placeholderTextColor="#777"
                    secureTextEntry={field.secure}
                    keyboardType={
                      field.name === 'phoneNumber'
                        ? 'phone-pad'
                        : field.name === 'email'
                          ? 'email-address'
                          : 'default'
                    }
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={(val) => {
                      setUserData({ ...userData, [field.name]: val });
                      setError(null);
                      if (field.name === 'username') {
                        usernameCheck(val);
                      }
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
                      setUserData({ ...userData, [field.name]: val });
                      setError(null);
                    }}
                  />
                )}
              </View>
              {showError && <Text className="mt-1 text-sm text-red-500">{field.errorMessage}</Text>}
            </View>
          );
        })}
      </View>

      {error && <Text className="mb-3 text-center text-red-500">{error}</Text>}

      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={onCancel}
          className="mt-4 flex-1 rounded-lg border-2 border-gray-800 py-3">
          <Text className="text-center text-xl font-medium text-gray-800">Back to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          className={`mt-4 flex-1 rounded-lg py-3 ${hasValidationErrors ? 'bg-gray-300' : 'bg-sky-600'}`}>
          <Text className="text-center text-xl font-medium text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepOneForm;
