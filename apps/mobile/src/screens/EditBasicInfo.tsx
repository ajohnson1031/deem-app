import { Fontisto } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtomValue } from 'jotai';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
  const { countryCode, onSelect, callingCode } = useCountryPicker();
  const [userData, setUserData] = useState<Omit<UserData, 'password' | 'avatarUri'>>({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    countryCode: user?.countryCode || countryCode || 'US',
    callingCode: user?.callingCode || callingCode || '1',
  });
  const [baseError, setBaseError] = useState<string | null>(null);

  const hasValidationErrors = FIELDS.some((field) => {
    if (field.name === 'password') return null; // should never happen due to filter
    const key = field.name as Exclude<keyof UserData, 'password' | 'avatarUri'>;
    const value = userData[key];
    if (field.name === 'phoneNumber') {
      return value ? !isValidPhoneNumber(value, countryCode) : false;
    }
    return !field.matches.test(value?.trim() || '');
  });

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
          <View className="mb-10 mt-4 flex h-[1px] bg-gray-200" />

          <View className="flex">
            {/* Input fields */}
            {FIELDS.map((field: FieldType, idx) => {
              if (field.name === 'password') return null; // should never happen due to filter
              const key = field.name as Exclude<keyof UserData, 'password' | 'avatarUri'>;
              const value = userData[key];
              const isValid = !value || field.matches.test(value); // only validate if value is non-empty
              const showError = value && !isValid;

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
                    <View className="mb-2 flex-row items-center bg-gray-100 px-3 py-1">
                      <Text className="mr-2 text-lg font-semibold text-[#777]">Country:</Text>
                      {userData.countryCode && (
                        <CountryPickerTrigger
                          countryCode={userData.countryCode as any}
                          onSelect={onSelect}
                        />
                      )}
                      {userData.countryCode === 'US' && <Text className="text-lg">(default)</Text>}
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
            disabled={hasValidationErrors || !!baseError}
            className={`mt-4 flex-1 rounded-lg py-3 ${hasValidationErrors || !!baseError ? 'bg-gray-200' : 'bg-sky-600'}`}>
            <Text
              className={`text-center text-xl font-medium ${hasValidationErrors || !!baseError ? 'text-gray-400' : 'text-white'}`}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default EditBasicInfo;
