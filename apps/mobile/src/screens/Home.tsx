import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '~/contexts/AuthContext';
import { useGlobalKeyboardIdleDismiss, useWallet } from '~/hooks';
import { RootStackParamList } from '~/types';

// Inside your component

const HomeScreen = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login } = useAuth();
  const { loadWallet } = useWallet();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { resetIdleTimer, cancelIdleTimer } = useGlobalKeyboardIdleDismiss(3500);

  const handleLogin = async () => {
    setLoginError(null); // Reset any prior error

    try {
      await login(identifier, password);
      await loadWallet(password);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setLoginError('Incorrect username or password.\nPlease try again.');
        } else if (err.response?.status === 400) {
          setLoginError('Please provide both username/email and password to continue.');
        } else {
          setLoginError('Something went wrong. Please try again later.');
        }
      } else {
        setLoginError('Unexpected error. Please try again.');
      }
    }
  };

  const clearFields = () => {
    setIdentifier('');
    setPassword('');
    setLoginError(null);
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-7xl font-extrabold text-black">Deem</Text>
      <Text className="mb-8 text-lg">Every penny counts.</Text>

      <View className="w-3/4 gap-3">
        {/* Input: Username or Email */}
        <View className="w-full rounded-lg bg-gray-100">
          <TextInput
            className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
            value={identifier}
            placeholder="Username or Email"
            placeholderTextColor="#777"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={cancelIdleTimer}
            onChangeText={(val) => {
              setIdentifier(val);
              setLoginError(null);
              resetIdleTimer();
            }}
          />
        </View>

        {/* Input: Password */}
        <View className="w-full rounded-lg bg-gray-100">
          <TextInput
            className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
            value={password}
            placeholder="Password"
            placeholderTextColor="#777"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            onFocus={cancelIdleTimer}
            onChangeText={(val) => {
              setPassword(val);
              setLoginError(null);
              resetIdleTimer();
            }}
          />
        </View>

        {/* Error Message */}
        {loginError && <Text className="text-md text-center text-red-500">{loginError}</Text>}

        {/* Login Button */}
        <TouchableOpacity className="w-full rounded-lg bg-sky-600 py-3" onPress={handleLogin}>
          <Text className="text-center text-xl font-medium text-white">Login</Text>
        </TouchableOpacity>
      </View>

      {/* Divider & Register Button */}
      <View className="mb-3 mt-6 h-[1px] w-3/4 border-b border-gray-200" />
      <View className="flex flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ForgotPassword');
            setTimeout(() => clearFields(), 300);
          }}>
          <Text className="text-center text-lg font-medium text-sky-600">Change Password</Text>
        </TouchableOpacity>
        <Text className="font-bold">|</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Register');
            setTimeout(() => clearFields(), 300);
          }}>
          <Text className="text-center text-lg font-medium text-sky-600">Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
