import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Text, TouchableOpacity, View } from 'react-native';

import { BaseModalProps } from '~/types';

const ConfirmLogoutModal = ({ visible, onConfirm, onCancel }: BaseModalProps) => {
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
          <View className="flex items-center gap-2">
            <Text className="text-xl font-semibold">You're logging out. Are you sure?</Text>
          </View>

          <View className="my-2 h-[1px] bg-gray-200" />

          <TouchableOpacity onPress={onConfirm} className="flex items-center px-4 py-2">
            <Text className="text-xl font-semibold text-red-600">Confirm Secure Logout</Text>
          </TouchableOpacity>

          <View className="my-2 h-[1px] bg-gray-200" />

          <TouchableOpacity onPress={onCancel} className="flex items-center px-4 py-2">
            <Text className="text-xl font-medium text-slate-600">Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ConfirmLogoutModal;
