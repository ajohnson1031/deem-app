import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

import { registerAtom, usernameAvailabilityAtom } from '~/atoms';
import CountdownInput from '~/components/CountdownInput';
import CountryPickerTrigger from '~/components/CountryPickerTrigger';
import ImagePickerModal from '~/components/ImagePickerModal';
import PasswordInput from '~/components/PasswordInput';
import { FIELDS, REGEX } from '~/constants';
import { useCountryPicker, useImagePicker, useUsernameChecker } from '~/hooks';
import { BasicInfoStepProps, UserData } from '~/types';
import { formatPhoneOnBlur, isValidPhoneNumber, sanitizePhone } from '~/utils';

const BasicInfoStep = ({ onComplete }: BasicInfoStepProps) => {
  const { requestPermissions, takePhoto, pickFromLibrary } = useImagePicker();
  const availability = useAtomValue(usernameAvailabilityAtom);
  const usernameCheck = useUsernameChecker();
  const { countryCode, onSelect, callingCode } = useCountryPicker();
  const [userData, setUserData] = useAtom(registerAtom);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [baseError, setBaseError] = useState<string | null>(null);

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

  const openImagePicker = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera and media access are needed.');
      return;
    }
    setModalVisible(true);
  };

  const handleChoosePhoto = async () => {
    const result = await pickFromLibrary();
    if (result) setUserData((prev: any) => ({ ...prev, avatarUri: result.uri }));
    setModalVisible(false);
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) setUserData((prev: any) => ({ ...prev, avatarUri: result.uri }));
    setModalVisible(false);
  };

  const handleRemovePhoto = () => {
    setUserData((prev: any) => ({ ...prev, avatarUri: '' }));
    setModalVisible(false);
  };

  const handleFieldBlur = (fieldName: string) => {
    if (fieldName === 'phoneNumber') {
      formatPhoneOnBlur(phoneNumber as string, countryCode);
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (!val.length) {
      setBaseError('Confirm password field must not be empty.');
    } else if (val !== password) {
      setBaseError('Password fields do not match.');
    } else if (!REGEX.PASSWORD.test(val as string)) {
      setBaseError(
        'Password must be 8 - 30 chars and include one of each of the following: uppercase, lowercase, number, special character (not @).'
      );
    } else {
      setBaseError(null);
    }
  };

  const handleNext = () => {
    setBaseError(null);

    if (!name || !username || !email || !password) {
      setBaseError('Please fill in all required fields.');
      return;
    }

    if (!availability.available) return;

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
    if (
      ['password', 'avatarUri', 'id', 'walletAddress', 'createdAt', 'updatedAt'].includes(
        field.name
      )
    )
      return null;

    const key = field.name as Exclude<
      keyof UserData,
      | 'password'
      | 'avatarUri'
      | 'id'
      | 'walletAddress'
      | 'createdAt'
      | 'updatedAt'
      | 'twoFactorEnabled'
    >;
    const value = userData[key];
    if (field.name === 'phoneNumber') {
      return value ? !isValidPhoneNumber(value, countryCode) : false;
    }
    return !field.matches.test(value?.trim() || '');
  });

  const nextDisabled =
    hasValidationErrors ||
    !!baseError ||
    !availability.available ||
    !password.length ||
    !confirmPassword.length ||
    password !== confirmPassword;

  return (
    <View className="flex w-full flex-1 justify-between px-6">
      <View>
        <ImagePickerModal
          visible={modalVisible}
          avatarUri={avatarUri}
          onChoosePhoto={handleChoosePhoto}
          onTakePhoto={handleTakePhoto}
          onRemovePhoto={handleRemovePhoto}
          onCancel={() => setModalVisible(false)}
        />

        <View className="mb-8 flex-row items-center gap-10">
          <TouchableOpacity onPress={openImagePicker} className="flex justify-center">
            <View className="mb-2 self-center rounded-full">
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
                    <Text className="text-3xl font-medium text-white">
                      {initials.toUpperCase()}
                    </Text>
                  </View>
                  <View className="relative bottom-9 left-20 flex items-center justify-center self-start rounded-full border-2 border-white bg-gray-200 p-2">
                    <FontAwesome name="camera" size={22} color="#4b5563" />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View className="flex gap-2 self-center">
            {!avatarUri && (
              <Text className="text-md text-slate-500">{`No photo selected.\nInitials will be used.`}</Text>
            )}
          </View>
        </View>

        <View className="flex">
          {/* Input fields */}
          {FIELDS.map((field, idx) => {
            if (['avatarUri', 'id', 'walletAddress', 'createdAt', 'updatedAt'].includes(field.name))
              return null;
            const key = field.name as Exclude<
              keyof UserData,
              'avatarUri' | 'id' | 'walletAddress' | 'createdAt' | 'updatedAt'
            >;
            const value = userData[key];
            const isValid = !value || field.matches.test(value as string); // only validate if value is non-empty
            const showError =
              field.name === 'phoneNumber'
                ? value && !isValidPhoneNumber(value as string, countryCode)
                : value && !isValid;

            return (
              <View key={idx}>
                {field.name === 'username' && value!.toString().length >= 6 && (
                  <View
                    className={`mb-1 self-start rounded-lg px-2 py-1 text-sm ${
                      availability.checking
                        ? 'bg-gray-50'
                        : availability.available
                          ? 'bg-green-50'
                          : 'bg-red-50'
                    }`}>
                    {availability.checking && <Text className="text-slate-500">Checking...</Text>}
                    {availability.available && (
                      <View className="flex flex-row items-center gap-1.5">
                        <Feather name="check-circle" size={14} color="#15803d" />
                        <Text className="text-green-600">Username is available</Text>
                      </View>
                    )}
                    {!availability.available && (
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
                    <CountryPickerTrigger countryCode={countryCode} onSelect={onSelect} />
                    {countryCode === 'US' && <Text className="text-xl font-medium">(default)</Text>}
                  </View>
                )}
                <View className="mb-2 flex-row gap-2">
                  {field.name === 'phoneNumber' && (
                    <View>
                      <Text
                        className={`flex-1 rounded-lg bg-gray-100 px-3 py-4 text-xl font-semibold leading-[18px] ${!phoneNumber?.toString().length ? 'text-[#777]' : 'text-black'}`}>{`+ ${callingCode}`}</Text>
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
                      value={value as string}
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
                    <View className="flex">
                      <View className="mb-2 h-[1px] bg-gray-200" />
                      <PasswordInput
                        placeholder={field.placeholder}
                        placeholderTextColor="#777"
                        secureTextEntry={field.secure}
                        keyboardType={field.keyboardType}
                        autoCapitalize="none"
                        maxLength={field.maxLength}
                        showCountdown
                        value={value as string}
                        onChangeText={(val) => {
                          setUserData({ ...userData, [field.name]: val });
                          setBaseError(null);
                        }}
                      />
                    </View>
                  )}
                </View>
                {showError && (
                  <Text className="mb-2 text-sm text-red-600">{field.errorMessage}</Text>
                )}
              </View>
            );
          })}
          <PasswordInput
            keyboardType="default"
            placeholder="Confirm Password"
            placeholderTextColor="#777"
            secureTextEntry
            autoCapitalize="none"
            maxLength={30}
            showCountdown
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
          />
        </View>
        {baseError && <Text className="mb-3 mt-2 text-red-600">{baseError}</Text>}
      </View>
      <View className="mb-8 flex-row gap-4">
        <TouchableOpacity
          onPress={handleNext}
          disabled={nextDisabled}
          className={`mt-4 flex-1 rounded-lg py-4 ${nextDisabled ? 'bg-gray-200' : 'bg-sky-600'}`}>
          <Text
            className={`text-center text-xl font-medium ${nextDisabled ? 'text-gray-400' : 'text-white'}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BasicInfoStep;
