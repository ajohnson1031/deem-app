import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onCancel: () => void;
}

const ImagePickerModal = ({
  visible,
  onTakePhoto,
  onChoosePhoto,
  onCancel,
}: ImagePickerModalProps) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (!showModal) {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <Modal transparent visible={showModal} animationType="none">
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)'],
          }),
          gap: 8,
        }}>
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="w-[90%] rounded-xl bg-white px-4 py-1">
          <Pressable className="py-4" onPress={onChoosePhoto}>
            <Text className="text-center text-2xl text-blue-500">Choose Photo</Text>
          </Pressable>
          <View className="my-1 h-[1px] bg-gray-200" />
          <Pressable className="py-4" onPress={onTakePhoto}>
            <Text className="text-center text-2xl text-blue-500">Take Photo</Text>
          </Pressable>
        </Animated.View>
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="mb-12 w-[90%] rounded-xl bg-white px-4 py-2">
          <Pressable className="py-4" onPress={onCancel}>
            <Text className="text-center text-2xl font-medium text-red-500">Cancel</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ImagePickerModal;
