import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Text, TouchableOpacity, View } from 'react-native';

import CountdownInput from '~/components/CountdownInput';
import { FieldVariant } from '~/types';

interface TwoFAPromptModalProps {
  visible: boolean;
  value: string;
  onChangeValue: (val: string) => void;
  onConfirm: (token: string) => Promise<void>;
  onCancel: () => void;
  error: string;
}

const TwoFAPromptModal = ({
  visible,
  value,
  onChangeValue,
  onConfirm,
  onCancel,
  error,
}: TwoFAPromptModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
          className="flex w-11/12 gap-2 rounded-3xl bg-white p-6 shadow-lg">
          <Text className="text-xl font-semibold text-slate-800">Enter Your 2FA Code</Text>
          <Text className="text-lg leading-snug text-slate-600">
            Please enter the 6-digit code from your authenticator app.
          </Text>

          <View className="my-2 h-[1px] bg-gray-200" />

          <CountdownInput
            variant={FieldVariant.MASKED}
            keyboardType="numeric"
            maxLength={6}
            placeholder="e.g., 123456"
            value={value}
            onChangeText={onChangeValue}
          />

          {error && <Text className="mb-2 text-sm text-red-600">{error}</Text>}

          <View className="mt-4 flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="rounded-lg border border-slate-600 px-4 py-2">
              <Text className="text-lg font-medium text-slate-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(value)}
              className="rounded-lg bg-sky-600 px-4 py-2">
              <Text className="text-lg font-medium text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default TwoFAPromptModal;
