import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { PasswordInput, TwoFAPromptModal } from '~/components';
import { useAuth } from '~/contexts/AuthContext';
import { useGlobalKeyboardIdleDismiss, useWallet } from '~/hooks';
import { RootStackParamList } from '~/types';

// Inside your component

const HomeScreen = () => {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [twoFAModalVisible, setTwoFAModalVisible] = useState<boolean>(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState<string>('');

  const { login, verify2FA } = useAuth();
  const { loadWallet } = useWallet();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { resetIdleTimer, cancelIdleTimer } = useGlobalKeyboardIdleDismiss(3500);

  const handleLoginError = (err: any) => {
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
  };

  const handleLogin = async () => {
    setLoginError(null);

    try {
      const result = await login(identifier, password);

      if (result.success) {
        await loadWallet(password);
        return;
      }

      if (result.requires2FA) {
        setTempUserId(result.tempUserId!); // ✅ Store tempUserId
        setTwoFAModalVisible(true);
      }
    } catch (err: any) {
      handleLoginError(err);
    }
  };

  const clearFields = () => {
    setIdentifier('');
    setPassword('');
    setLoginError(null);
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <TwoFAPromptModal
        visible={twoFAModalVisible}
        value={twoFACode}
        onChangeValue={setTwoFACode}
        error={loginError ?? ''}
        onConfirm={async (token: string) => {
          try {
            if (!tempUserId) return;
            await verify2FA(tempUserId, token, password);
            setTwoFAModalVisible(false); // ✅ Hide modal
            setTempUserId(null); // ✅ Clear temp user ID
            setTwoFACode(''); // Clear 2FA code
            await loadWallet(password); // 🔓 Load wallet after 2FA
          } catch (err) {
            console.error('2FA verification failed:', err);
            setLoginError('Invalid 2FA code. Please try again.');
          }
        }}
        onCancel={() => {
          setTwoFAModalVisible(false);
          setTempUserId(null); // Also clear on cancel
          setTwoFACode(''); // Clear 2FA code
        }}
      />

      <Text className="text-7xl font-extrabold text-black">Deem</Text>
      <Text className="mb-8 text-lg">Every penny counts.</Text>

      <View className="w-3/4 gap-3">
        {/* Input: Username or Email */}
        <TextInput
          className="w-full rounded-lg bg-gray-100 px-3 py-4 text-xl font-medium leading-[18px]"
          value={identifier}
          placeholder="Username or Email"
          placeholderTextColor="#777"
          autoCapitalize="none"
          autoCorrect={false}
          editable
          onFocus={cancelIdleTimer}
          onChangeText={(val) => {
            setIdentifier(val);
            setLoginError(null);
            resetIdleTimer();
          }}
        />

        {/* Input: Password */}
        <PasswordInput
          value={password}
          placeholder="Password"
          placeholderTextColor="#777"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={cancelIdleTimer}
          onChangeText={(val) => {
            setPassword(val);
            setLoginError(null);
            resetIdleTimer();
          }}
        />

        {/* Error Message */}
        {loginError && <Text className="text-md text-center text-red-600">{loginError}</Text>}

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
