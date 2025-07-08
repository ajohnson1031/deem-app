import { API_BASE_URL, AVATAR_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

import { registerAtom } from '~/atoms';
import { WalletStep } from '~/components';
import UserDataForm from '~/components/UserDataForm';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types';
import { deriveKeyFromPassword, encryptSeed } from '~/utils';
import { api } from '~/utils/api';

const RegisterScreen = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useAtom(registerAtom);
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const handleAvatarUpload = async (): Promise<string | undefined> => {
    if (!userData.avatarUri || userData.avatarUri.startsWith('http')) return userData.avatarUri;

    const filename = `avatar_${uuidv4()}.jpg`;
    const formData = new FormData();

    formData.append('file', {
      uri: userData.avatarUri,
      name: filename,
      type: 'image/jpeg',
    } as any);
    formData.append('upload_preset', AVATAR_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload failed',
          text2: 'Could not upload your avatar. Try again later.',
        });
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      Toast.show({
        type: 'error',
        text1: 'Upload error',
        text2: 'Something went wrong while uploading your avatar.',
      });
    }

    return undefined;
  };

  const handleStepOneCancel = () => {
    navigation.navigate('Home');
    setTimeout(() => {
      setUserData({
        name: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        avatarUri: undefined,
        countryCode: 'US',
        callingCode: '1',
      });
    }, 300);
  };

  const handleStepOneComplete = (data: any) => {
    setUserData(data);
    setStep(2);
  };

  const handleStepTwoCancel = () => setStep(1);

  const handleStepTwoComplete = async ({
    walletAddress,
    seed,
  }: {
    walletAddress: string;
    seed: string;
  }) => {
    try {
      const { password, avatarUri, ...rest } = userData;

      const key = await deriveKeyFromPassword(password);
      const encryptedSeed = encryptSeed(seed, key);

      const uploadedAvatarUrl = await handleAvatarUpload();

      await api.post(`${API_BASE_URL}/auth/register`, {
        ...rest,
        avatarUrl: uploadedAvatarUrl,
        password,
        walletAddress,
        encryptedSeed,
      });

      navigation.navigate('Home');
      Toast.show({
        type: 'success',
        text1: `Welcome to Deem, ${userData.name.split(' ')[0]}!`,
        text2: 'Please login to continue.',
      });
    } catch (err: any) {
      console.error('Registration failed:', err);

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: err?.response?.data?.error || 'Please try again later.',
      });
    }
  };

  return (
    <CoreLayout>
      <View className="flex-1 justify-center">
        {step === 1 && (
          <UserDataForm onComplete={handleStepOneComplete} onCancel={handleStepOneCancel} />
        )}
        {step === 2 && (
          <WalletStep onComplete={handleStepTwoComplete} onCancel={handleStepTwoCancel} />
        )}
      </View>
    </CoreLayout>
  );
};

export default RegisterScreen;
