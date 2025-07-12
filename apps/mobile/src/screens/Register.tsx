import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

import { registerAtom } from '~/atoms';
import { UserDataStep, WalletStep } from '~/components';
import { CoreLayout } from '~/layouts';
import { RootStackParamList } from '~/types';
import { deriveKeyFromPassword, encryptSeed, handleAvatarUpload } from '~/utils';
import { api } from '~/utils/api';

const RegisterScreen = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useAtom(registerAtom);

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

      const uploadedavatarUri = await handleAvatarUpload(avatarUri);

      await api.post(`${API_BASE_URL}/auth/register`, {
        ...rest,
        avatarUri: uploadedavatarUri,
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
          <UserDataStep onComplete={handleStepOneComplete} onCancel={handleStepOneCancel} />
        )}
        {step === 2 && (
          <WalletStep onComplete={handleStepTwoComplete} onCancel={handleStepTwoCancel} />
        )}
      </View>
    </CoreLayout>
  );
};

export default RegisterScreen;
