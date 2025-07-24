import { API_BASE_URL } from '@env';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Text, TouchableOpacity, View } from 'react-native';

import CountdownInput from '~/components/CountdownInput';
import { REGEX } from '~/constants';
import { useAuth } from '~/contexts/AuthContext';
import { BaseModalProps, FieldVariant } from '~/types';
import { api } from '~/utils/api';

const PasswordVerificationPromptModal = ({ visible, onConfirm, onCancel }: BaseModalProps) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const passwordError =
    'Password not in expected format (8 - 30 chars and include one of each of the following: uppercase, lowercase, number, special character (not @)).';

  const handleConfirm = async () => {
    if (!REGEX.PASSWORD.test(password)) {
      setError(passwordError);
      return;
    }

    try {
      const res = await api.post(`${API_BASE_URL}/auth/verify-password`, {
        password,
        id: user?.id,
      });

      if (res.status === 200) {
        setError('');
        onConfirm({ password });
        setPassword('');
      }
    } catch (error: any) {
      const {
        response: {
          data: { message },
        },
      } = error || "Password didn't match.";
      setError(message);
      // setError(error);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1.2);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View className="flex-1 items-center justify-center bg-black/30 px-6">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="w-11/12 gap-2 rounded-3xl bg-white p-6 shadow-lg">
          <View className="flex gap-2">
            <Text className="text-xl font-semibold text-slate-800">Verify Your Password</Text>
            <Text className="text-lg leading-snug text-slate-600">
              Please verify your password to proceed with wallet regeneration.
            </Text>
          </View>

          <View className="my-2 h-[1px] bg-gray-200" />

          <View>
            <CountdownInput
              variant={FieldVariant.MASKED}
              placeholder="Enter password"
              placeholderTextColor="#777"
              value={password}
              maxLength={30}
              onChangeText={(text: string) => {
                setPassword(text);
                setError('');
              }}
            />

            {error && <Text className="mt-1.5 text-sm text-red-600">{error}</Text>}
          </View>

          <View className="mt-4 flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="rounded-lg border border-slate-600 px-4 py-2">
              <Text className="text-lg font-medium text-slate-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} className="rounded-lg bg-sky-600 px-4 py-2">
              <Text className="text-lg font-medium text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PasswordVerificationPromptModal;
