import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Text, TouchableOpacity, View } from 'react-native';

import { CountdownInput } from '~/components';
import { EncryptionModalMode, FieldVariant, ModalPromptProps, ModalPromptVariant } from '~/types';

const getPlaceholder = (variant: ModalPromptVariant) => {
  switch (variant) {
    case 'passphrase':
      return 'Enter passphrase';
    case 'password':
      return 'Enter password';
    case '2fa':
      return 'e.g., 123456';
  }
};

const getInputProps = (variant: ModalPromptVariant) => {
  switch (variant) {
    case 'passphrase':
    case 'password':
      return { variant: FieldVariant.MASKED, maxLength: 30, keyboardType: 'default' as const };
    case '2fa':
      return { variant: FieldVariant.MASKED, maxLength: 6, keyboardType: 'numeric' as const };
  }
};

// Helper for passphrase header/desc based on mode
function getModalText(mode?: EncryptionModalMode) {
  if (mode === EncryptionModalMode.EXPORT) {
    return {
      title: 'Protect Your Backup with Encryption',
      description:
        'For your safety, Deem requires a strong passphrase to encrypt your wallet export.',
    };
  }
  if (mode === EncryptionModalMode.IMPORT) {
    return {
      title: 'Enter Encrypted Passphrase',
      description: 'Enter the passphrase you used during export.',
    };
  }
  // fallback
  return {
    title: 'Password Required',
    description: 'Please enter your password.',
  };
}

const ModalPrompt = ({
  visible,
  variant,
  title,
  description,
  value,
  onChangeValue,
  onConfirm,
  onCancel,
  isProcessing = false,
  error,
  mode,
}: ModalPromptProps) => {
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

  const inputProps = getInputProps(variant);

  let effectiveTitle = title;
  let effectiveDescription = description;
  if (!title || !description) {
    const { title: t, description: d } = getModalText(mode);
    if (!title) effectiveTitle = t;
    if (!description) effectiveDescription = d;
  }

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View className="flex-1 items-center justify-center bg-black/30 px-6">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
          className="w-11/12 gap-2 rounded-3xl bg-white p-6 shadow-lg">
          <View className="flex gap-2">
            <Text className="text-xl font-semibold text-slate-800">{effectiveTitle}</Text>
            <Text className="text-lg leading-snug text-slate-600">{effectiveDescription}</Text>
          </View>

          <View className="my-2 h-[1px] bg-gray-200" />

          <CountdownInput
            {...inputProps}
            placeholder={getPlaceholder(variant)}
            placeholderTextColor="#777"
            value={value}
            onChangeText={onChangeValue}
          />

          {error && <Text className="mt-1.5 text-sm text-red-600">{error}</Text>}

          <View className="mt-4 flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="rounded-lg border border-slate-600 px-4 py-2 disabled:border-gray-300"
              disabled={isProcessing}>
              <Text
                className={`text-lg font-medium ${isProcessing ? 'text-gray-300' : 'text-slate-600'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="rounded-lg bg-sky-600 px-4 py-2 disabled:bg-gray-400"
              disabled={isProcessing}>
              {isProcessing && (variant === 'passphrase' || variant === 'password') ? (
                <View className="flex-row items-center gap-1">
                  <Text className="text-lg font-medium text-white">Processing...</Text>
                  <LottieView
                    source={require('~/../assets/animations/loading-spinner-white.json')}
                    autoPlay
                    loop
                    style={{ width: 24, height: 24 }}
                  />
                </View>
              ) : (
                <Text className="text-lg font-medium text-white">Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ModalPrompt;
