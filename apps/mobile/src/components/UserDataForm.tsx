import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import * as ImagePicker from 'expo-image-picker';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { registerAtom, usernameAvailabilityAtom } from '~/atoms';
import { CountdownInput, CountryPickerTrigger, PasswordInput } from '~/components';
import { FIELDS } from '~/constants';
import { useCountryPicker, useUsernameChecker } from '~/hooks';
import { UserDataFormProps } from '~/types';
import { formatPhoneOnBlur, isValidPhoneNumber, sanitizePhone } from '~/utils';

const UserDataForm = ({ onComplete, onCancel }: UserDataFormProps) => {
  const [userData, setUserData] = useAtom(registerAtom);
  const availability = useAtomValue(usernameAvailabilityAtom);
  const [baseError, setBaseError] = useState<string | null>(null);
  const usernameCheck = useUsernameChecker();
  const { countryCode, onSelect, callingCode } = useCountryPicker();
  const {
    name,
    username,
    email,
    phoneNumber,
    password,
    avatarUri,
    countryCode: userCountryCode,
    callingCode: userCallingCode,
  } = userData;
  const splitName = name?.split(' ') || ['', ''];
  const [firstname, lastname] = [splitName[0], splitName[1] || ''];
  const initials = name ? `${firstname[0]}${lastname[0] || ''}` : 'JD';

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setBaseError('Permission to access media library is required!');
      return;
    }

    // If an avatar is already selected, deselect it
    if (avatarUri) {
      setUserData((prev) => ({ ...prev, avatarUri: undefined }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // force square crop
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUserData((prev) => ({ ...prev, avatarUri: result.assets[0].uri }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    if (fieldName === 'phoneNumber') {
      formatPhoneOnBlur(userData.phoneNumber, countryCode);
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
      countryCode: userCountryCode,
      callingCode: userCallingCode,
    });
  };

  const hasValidationErrors = FIELDS.some((field) => {
    const value = userData[field.name];
    if (field.name === 'phoneNumber') {
      return value ? !isValidPhoneNumber(value, countryCode) : false;
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
        <View className="mb-8 flex-row items-center gap-6">
          <View className="self-center rounded-full border border-gray-300 p-2">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="h-28 w-28 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-28">
                <View
                  className="h-28 w-28 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#0284c7' }}>
                  <Text className="text-3xl font-medium text-white">{initials.toUpperCase()}</Text>
                </View>
                <View className="relative bottom-8 left-20 flex items-center justify-center self-start rounded-full border-2 border-white bg-gray-200 p-2">
                  <FontAwesome name="camera" size={22} color="#4b5563" />
                </View>
              </View>
            )}
          </View>

          <View className="flex gap-2 self-center">
            {!avatarUri && <Text className="text-sm text-gray-500">No photo selected.</Text>}
            <TouchableOpacity
              onPress={pickImage}
              className={`rounded-lg px-3 py-2 ${!avatarUri ? 'bg-sky-600' : 'bg-red-600'}`}>
              <Text className="font-medium text-white">
                {!avatarUri ? 'Select Photo' : 'Remove Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex">
          {/* Input fields */}
          {FIELDS.map((field, idx) => {
            const value = userData[field.name];
            const isValid = !value || field.matches.test(value); // only validate if value is non-empty
            const showError = value && !isValid;

            return (
              <View key={idx}>
                {field.name === 'username' && value!.length >= 6 && (
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
                        <Fontisto name="close" size={14} color="#dc2626" />
                        <Text className="text-red-600">Username is taken</Text>
                      </View>
                    )}
                  </View>
                )}
                {field.name === 'phoneNumber' && (
                  <View className="mb-2 flex-row items-center bg-gray-100 px-3 py-1">
                    <Text className="mr-2 text-lg font-semibold text-[#777]">Country:</Text>
                    <CountryPickerTrigger countryCode={countryCode} onSelect={onSelect} />
                    {countryCode === 'US' && <Text className="text-lg">(default)</Text>}
                  </View>
                )}
                <View className="mb-2 flex-row gap-2">
                  {field.name === 'phoneNumber' && (
                    <View>
                      <Text
                        className={`flex-1 rounded-lg bg-gray-100 px-3 py-4 text-lg font-semibold leading-[18px] ${!phoneNumber.length ? 'text-[#777]' : 'text-black'}`}>{`+ ${callingCode}`}</Text>
                    </View>
                  )}
                  {field.name !== 'password' ? (
                    <CountdownInput
                      className="flex-1"
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
                          field.name === 'phoneNumber' ? sanitizePhone(val) : val;

                        setUserData({ ...userData, [field.name]: formattedVal });

                        if (field.name === 'username') {
                          usernameCheck(val);
                        }
                      }}
                      onBlur={() => handleFieldBlur(field.name)}
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
          className={`mt-4 flex-1 rounded-lg py-3 ${hasValidationErrors || !!baseError ? 'bg-gray-200' : 'bg-sky-600'}`}>
          <Text
            className={`text-center text-xl font-medium ${hasValidationErrors || !!baseError ? 'text-gray-400' : 'text-white'}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserDataForm;
