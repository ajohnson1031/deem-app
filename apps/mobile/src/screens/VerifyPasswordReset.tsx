import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useRef, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';

import PinOrCodeInputField from '~/components/PinOrCodeInputField';
import { RootStackParamList } from '~/types';
import { buzzAndShake } from '~/utils/feedback';

const VerifyPasswordResetScreen = ({ route }: { route: { params: { email: string } } }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const email = route.params;

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return; // short-circuit

    try {
      setSubmitting(true);
      const response = await axios.post('/auth/verify-reset-code', { email, code });

      if (response.status === 200) {
        const userId = response.data.userId;
        navigation.navigate('ResetPassword', { userId });
      }
    } catch (err: any) {
      console.error('Code verification failed:', err);
      buzzAndShake(shakeAnim);
      Alert.alert('Invalid Code', 'Please check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-6 text-2xl font-bold text-black">Enter Verification Code</Text>
      <Text className="mb-6 text-center text-lg text-gray-600">
        {`We've sent a 6-digit code to ${email}`}
      </Text>

      <PinOrCodeInputField
        type="VERIFICATION_CODE"
        cellCount={6}
        hideFieldValues={false}
        shakeRef={shakeAnim}
        onPinChange={handleCodeChange}
        onPinComplete={handleVerify}
        theme="LIGHT"
      />

      <TouchableOpacity
        disabled={submitting}
        className="mt-8 rounded-lg bg-sky-600 px-5 py-3"
        onPress={handleVerify}>
        <Text className="text-lg font-semibold text-white">
          {submitting ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyPasswordResetScreen;
