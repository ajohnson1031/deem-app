import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { View } from 'react-native';

import { registerAtom } from '~/atoms';
import { StepOneForm, StepTwoWallet } from '~/components';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types';
import { api, deriveKeyFromPassword, encryptSeed } from '~/utils';

const RegisterScreen = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setUserData = useSetAtom(registerAtom);

  const handleStepOneCancel = () => {
    setUserInfo(null);
    navigation.navigate('Home');
    setTimeout(() => {
      setUserData({
        name: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        avatarUri: undefined,
      });
    }, 300);
  };

  const handleStepOneComplete = (data: any) => {
    setUserInfo(data);
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
      const { password, ...rest } = userInfo;

      const key = await deriveKeyFromPassword(password);
      const encryptedSeed = encryptSeed(seed, key);

      await api.post('/auth/register', {
        ...rest,
        password,
        walletAddress,
        encryptedSeed,
      });

      navigation.navigate('Home'); // Or wherever login happens
    } catch (err) {
      console.error('Registration failed:', err);
      // Optionally: show error feedback
    }
  };

  return (
    <CoreLayout showBack>
      <View className="flex-1 justify-center">
        {step === 1 && (
          <StepOneForm onComplete={handleStepOneComplete} onCancel={handleStepOneCancel} />
        )}
        {step === 2 && (
          <StepTwoWallet onComplete={handleStepTwoComplete} onCancel={handleStepTwoCancel} />
        )}
      </View>
    </CoreLayout>
  );
};

export default RegisterScreen;
