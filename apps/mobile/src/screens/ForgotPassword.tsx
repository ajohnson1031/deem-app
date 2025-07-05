import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types';
import { api } from '~/utils/api'; // make sure your axios instance is exported from here

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    setError(null);
    setStatus('sending');

    try {
      await api.post('/auth/request-password-reset', { email });
      setStatus('sent');

      // Navigate to the next screen
      navigation.navigate('VerifyPasswordReset', { email });
    } catch (err: any) {
      setError(!email ? 'Please enter a valid email.' : 'Failed to send reset code.');
      setStatus('idle');
    }
  };

  return (
    <CoreLayout showBack>
      <View className="flex-1 justify-center bg-white p-6">
        <Text className="mb-4 text-4xl font-semibold">Password problems?</Text>
        <Text className="mb-4 text-lg text-gray-600">
          Enter the email address associated with your Deem account to receive a verification code.
        </Text>
        <View className="mb-3 w-full rounded-lg bg-gray-100">
          <TextInput
            className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setError(null);
            }}
          />
        </View>

        {error && <Text className="mb-3 text-red-500">{error}</Text>}

        <TouchableOpacity
          className="rounded-lg bg-sky-600 p-3"
          onPress={handleSubmit}
          disabled={status === 'sending'}>
          <Text className="text-center text-xl font-medium text-white">
            {status === 'sending' ? 'Sending...' : 'Send Password Reset Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </CoreLayout>
  );
};

export default ForgotPasswordScreen;
