import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { PasswordInput } from '~/components';
import { RootStackParamList } from '~/types';

const ResetPasswordScreen = ({ route }: { route: { params: { userId: string } } }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      navigation.navigate('Home');
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleReset = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill out both fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password fields do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        userId,
        newPassword,
      });

      setSuccessMessage('Password updated! Redirecting in');
      setCountdown(3);
    } catch (err) {
      console.error('Reset failed:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center gap-3 bg-white px-6">
      <Text className="mb-3 text-center text-2xl font-bold text-black">Reset Your Password</Text>

      <PasswordInput
        value={newPassword}
        onChangeText={(val) => {
          setError(null);
          setNewPassword(val);
        }}
        placeholder="New Password"
        placeholderTextColor="#777"
        secureTextEntry
      />

      <PasswordInput
        value={confirmPassword}
        onChangeText={(val) => {
          setError(null);
          setConfirmPassword(val);
        }}
        placeholder="Confirm Password"
        placeholderTextColor="#777"
        secureTextEntry
      />

      {error && <Text className="text-red-500">{error}</Text>}
      {successMessage && (
        <Text className="text-center text-green-600">
          {successMessage} {countdown}s...
        </Text>
      )}

      <TouchableOpacity
        disabled={submitting}
        onPress={handleReset}
        className="rounded-lg bg-sky-600 p-3">
        <Text className="text-center text-xl font-medium text-white">
          {submitting ? 'Updating...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;
