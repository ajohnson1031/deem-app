import { Feather, FontAwesome6, Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtomValue } from 'jotai';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Country } from 'react-native-country-picker-modal';

import { usernameAvailabilityAtom } from '~/atoms';
import { CountdownInput, CountryPickerTrigger } from '~/components';
import { FIELDS, FieldType } from '~/constants';
import { useAuth } from '~/contexts/AuthContext';
import { useCountryPicker, useUsernameChecker } from '~/hooks';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList, UserData } from '~/types';
import { formatPhoneOnBlur, sanitizePhone } from '~/utils';

const EditBasicInfo = () => {
  const { user } = useAuth() || {};
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentUserName = user?.username;
  const availability = useAtomValue(usernameAvailabilityAtom);
  const usernameCheck = useUsernameChecker();
  const { country, countryCode, onSelect, callingCode } = useCountryPicker();
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [userData, setUserData] = useState<Omit<UserData, 'password' | 'avatarUri'>>({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    countryCode: user?.countryCode || countryCode || 'US',
    callingCode: user?.callingCode || callingCode || '1',
  });

  const noChange = Object.entries(userData).every(([key, value]) => {
    return user?.[key as keyof typeof user] === value;
  });

  const [baseError, setBaseError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const hasValidationErrors = FIELDS.some((field) => {
    if (field.name === 'password') return null; // should never happen due to filter
    const key = field.name as Exclude<keyof UserData, 'password' | 'avatarUri'>;
    const value = userData[key];
    if (field.name === 'phoneNumber') {
      return value ? !isValidPhoneNumber(value, countryCode) : false;
    }
    return !field.matches.test(value?.trim() || '');
  });

  const shouldUpdate = !hasValidationErrors && !baseError && !isLocked && !noChange;

  const handleFieldBlur = (fieldName: string) => {
    if (fieldName === 'phoneNumber') {
      formatPhoneOnBlur(userData.phoneNumber ?? '', countryCode);
    }
  };

  const onCancel = () => {
    const { id, avatarUri, walletAddress, createdAt, updatedAt, ...rest } = user!;
    setUserData((prev) => ({ ...prev, ...rest }));
    navigation.goBack();
  };

  // TODO: Flesh out submit function
  const onSubmit = () => {};

  return (
    <CoreLayout>
      <View className="mt-10 flex w-full flex-1 justify-between px-6">
        <View>
          <View className="flex-row gap-2">
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={36}
              color="#475569"
              className="-mt-0.5"
            />
            <Text className="text-4xl text-slate-600">Edit Basic Info</Text>
          </View>

          <View className="my-4 flex h-[1px] bg-gray-200" />

          <Text className="text-lg text-gray-600">
            Feel free to update your personal identity info or change your username. Just be aware
            that what you see here is what we keep on file for any necesary communication.
          </Text>

          <View className="my-4 flex h-[1px] bg-gray-200" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 text-slate-600">
              <FontAwesome6 name={`${isLocked ? 'lock' : 'lock-open'}`} size={30} color="#475569" />
              <Text className="text-xl font-medium text-slate-600">{`${isLocked ? 'Editing is disabled.' : 'Editing is enabled.'}`}</Text>
            </View>

            <TouchableOpacity onPress={() => setIsLocked(!isLocked)}>
              <View className={`rounded-lg px-5 py-2 ${isLocked ? 'bg-sky-600' : 'bg-slate-600'}`}>
                <Text className="text-xl font-medium text-white">{`${isLocked ? 'Enable' : 'Disable'}`}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="my-4 flex h-[1px] bg-gray-200" />

          <View className="flex">
            {/* Input fields */}
            {FIELDS.map((field: FieldType, idx) => {
              if (field.name === 'password') return null; // should never happen due to filter
              const key = field.name as Exclude<keyof UserData, 'password' | 'avatarUri'>;
              const value = userData[key];
              const isValid = !value || field.matches.test(value); // only validate if value is non-empty
              const showError =
                field.name === 'phoneNumber'
                  ? value && !isValidPhoneNumber(value, countryCode)
                  : value && !isValid;

              return (
                <View key={idx}>
                  {field.name === 'username' && value!.length >= 6 && currentUserName !== value && (
                    <View
                      className={`mb-1 self-start rounded-lg px-2 py-1 text-sm ${
                        availability.checking
                          ? 'bg-gray-50'
                          : availability.available
                            ? 'bg-green-50'
                            : !availability.available && currentUserName === value
                              ? 'bg-gray-100'
                              : 'bg-red-50'
                      }`}>
                      {availability.checking && <Text className="text-gray-500">Checking...</Text>}
                      {availability.available && (
                        <View className="flex flex-row items-center gap-1.5">
                          <Feather name="check-circle" size={14} color="#15803d" />
                          <Text className="text-green-600">Username is available</Text>
                        </View>
                      )}

                      {currentUserName !== value && !availability.available && (
                        <View className="flex flex-row items-center gap-1.5">
                          <Fontisto name="close" size={14} color="#dc2626" />
                          <Text className="text-red-600">Username is taken</Text>
                        </View>
                      )}
                    </View>
                  )}
                  {field.name === 'phoneNumber' && (
                    <View className="mb-2 flex-row items-center rounded-lg bg-gray-100 px-3 py-1">
                      <Text className="mr-2 text-xl font-medium text-[#777]">Country:</Text>

                      <CountryPickerTrigger
                        country={selectedCountry}
                        countryCode={selectedCountry?.cca2 || (userData.countryCode as any)}
                        onSelect={(country) => {
                          setSelectedCountry(country);
                          setUserData((prev) => ({
                            ...prev,
                            countryCode: country.cca2 as CountryCode,
                            callingCode: country.callingCode[0] || '',
                          }));
                          onSelect(country);
                        }}
                        disabled={isLocked}
                      />

                      {userData.countryCode === 'US' && (
                        <Text className={`text-xl font-medium ${isLocked ? 'text-[#777]' : ''}`}>
                          (default)
                        </Text>
                      )}
                    </View>
                  )}
                  <View className="mb-2 flex-row gap-2">
                    {field.name === 'phoneNumber' && (
                      <View>
                        <Text
                          className={`flex-1 rounded-lg bg-gray-100 px-3 py-4 text-lg font-semibold leading-[18px] ${!userData.phoneNumber?.length ? 'text-[#777]' : 'text-black'}`}>{`+ ${userData.callingCode}`}</Text>
                      </View>
                    )}

                    <CountdownInput
                      className="flex-1"
                      textClassName={`${isLocked && '!text-gray-500'}`}
                      placeholder={field.placeholder}
                      placeholderTextColor="#777"
                      secureTextEntry={field.secure}
                      maxLength={field.maxLength}
                      keyboardType={field.keyboardType}
                      returnKeyType="done"
                      autoCapitalize="none"
                      editable={!isLocked}
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
            className="mt-4 flex-1 rounded-lg border-2 border-gray-600 py-3">
            <Text className="text-center text-xl font-medium text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={!shouldUpdate}
            className={`mt-4 flex-1 rounded-lg py-3 ${shouldUpdate ? 'bg-sky-600' : 'bg-gray-200'}`}>
            <Text
              className={`text-center text-xl font-medium ${shouldUpdate ? 'text-white' : 'text-gray-400'}`}>
              Update
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default EditBasicInfo;
