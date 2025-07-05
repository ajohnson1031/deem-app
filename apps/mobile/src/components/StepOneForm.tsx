import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, KeyboardTypeOptions, Text, TouchableOpacity, View } from 'react-native';

import { registerAtom, usernameAvailabilityAtom } from '~/atoms';
import { CountdownInput, PasswordInput } from '~/components';
import { useUsernameChecker } from '~/hooks';
import { StepOneFormProps, UserDataKey } from '~/types';
import { formatInternationalPhone, isValidPhoneNumber } from '~/utils';

const StepOneForm = ({ onComplete, onCancel }: StepOneFormProps) => {
  const [userData, setUserData] = useAtom(registerAtom);
  const { name, username, email, phoneNumber, password, avatarUri } = userData;
  const [baseError, setBaseError] = useState<string | null>(null);
  const usernameCheck = useUsernameChecker();
  const availability = useAtomValue(usernameAvailabilityAtom);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setBaseError('Permission to access media library is required!');
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
    setBaseError(null);

    if (!name || !username || !email || !password) {
      setBaseError('Please fill in all required fields.');
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
    matches: RegExp;
    keyboardType: KeyboardTypeOptions;
    errorMessage: string;
    maxLength: number;
    secure?: boolean;
  }[] = [
    {
      placeholder: 'Name',
      name: 'name',
      keyboardType: 'default',
      maxLength: 50,
      matches: /^[A-Za-z\s]+$/, // only letters and spaces
      errorMessage: 'Name may contain letters and spaces only.',
    },
    {
      placeholder: 'Username',
      name: 'username',
      keyboardType: 'default',
      maxLength: 21,
      matches: /^[a-zA-Z0-9_]{6,21}$/,
      errorMessage:
        'Username must be 6 - 21 characters in length and may contain letters, numbers & underscores only.',
    },
    {
      placeholder: 'Email',
      name: 'email',
      keyboardType: 'email-address',
      maxLength: 100,
      matches: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simple email regex
      errorMessage: 'Enter a valid email address.',
    },
    {
      placeholder: 'Password',
      name: 'password',
      keyboardType: 'default',
      secure: true,
      maxLength: 21,
      matches: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s@]).{8,21}$/, // strong password, excludes @
      errorMessage:
        'Password must be 8 - 21 chars and include uppercase, lowercase, number, and special character (not @).',
    },
    {
      placeholder: 'Phone (optional)',
      name: 'phoneNumber',
      keyboardType: 'phone-pad',
      maxLength: 50,
      matches: /.*/,
      errorMessage: 'Enter a valid phone number.',
    },
  ];

  const hasValidationErrors = FIELDS.some((field) => {
    const value = userData[field.name];
    if (field.name === 'phoneNumber') {
      return value ? !isValidPhoneNumber(value) : false;
    }
    return !field.matches.test(value?.trim() || '');
  });

  return (
    <View className="mt-10 flex w-full flex-1 justify-between px-6">
      <View>
        <Text className="mb-10 text-center text-3xl font-medium text-gray-700 underline">
          Create Your Deem Account
        </Text>

        {/* Avatar Picker */}
        <TouchableOpacity
          onPress={pickImage}
          className="mb-8 self-center rounded-full border border-gray-300 p-2">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="h-28 w-28 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="#0284c7 flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#0284c7]">
              <Feather name="camera" size={24} color="#0284c7" />
            </View>
          )}
        </TouchableOpacity>

        <View className="flex">
          {/* Input fields */}
          {FIELDS.map((field, idx) => {
            const value = userData[field.name];
            const isValid = !value || field.matches.test(value); // only validate if value is non-empty
            const showError = value && !isValid;

            return (
              <View key={idx}>
                {field.name === 'username' && value.length >= 6 && (
                  <View
                    className={`mb-1 self-start rounded-lg px-2 py-1 text-sm ${
                      availability.checking
                        ? 'bg-gray-50'
                        : availability.available
                          ? 'bg-green-50'
                          : 'bg-red-50'
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
                <View className="mb-2">
                  {field.placeholder !== 'Password' ? (
                    <CountdownInput
                      placeholder={field.placeholder}
                      placeholderTextColor="#777"
                      secureTextEntry={field.secure}
                      maxLength={field.maxLength}
                      keyboardType={field.keyboardType}
                      returnKeyType="done"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={(val) => {
                        setBaseError(null);
                        const formattedVal =
                          field.name === 'phoneNumber'
                            ? formatInternationalPhone(val) // <- real-time international formatting
                            : val;

                        setUserData({ ...userData, [field.name]: formattedVal });

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
                      keyboardType={field.keyboardType}
                      autoCapitalize="none"
                      maxLength={field.maxLength}
                      showCountdown
                      value={value}
                      onChangeText={(val) => {
                        setUserData({ ...userData, [field.name]: val });
                        setBaseError(null);
                      }}
                    />
                  )}
                </View>
                {showError && (
                  <Text className="mb-2 text-sm text-red-500">{field.errorMessage}</Text>
                )}
              </View>
            );
          })}
        </View>
        {baseError && <Text className="mb-3 text-center text-red-500">{baseError}</Text>}
      </View>
      <View className="mb-8 flex-row gap-4">
        <TouchableOpacity
          onPress={onCancel}
          className="mt-4 flex-1 rounded-lg border-2 border-gray-800 py-3">
          <Text className="text-center text-xl font-medium text-gray-800">Back to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          disabled={hasValidationErrors || !!baseError}
          className={`mt-4 flex-1 rounded-lg py-3 ${hasValidationErrors || !!baseError ? 'bg-gray-300' : 'bg-sky-600'}`}>
          <Text className="text-center text-xl font-medium text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepOneForm;
