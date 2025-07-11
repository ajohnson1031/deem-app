// useImagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

type ImagePickerResult = {
  uri: string;
} | null;

export const useImagePicker = () => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    return media.granted && camera.granted;
  };

  const pickFromLibrary = async (): Promise<ImagePickerResult> => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        return { uri: result.assets[0].uri };
      }
    } catch (e) {
      console.warn('Library picker failed', e);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const takePhoto = async (): Promise<ImagePickerResult> => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        return { uri: result.assets[0].uri };
      }
    } catch (e) {
      console.warn('Camera failed', e);
    } finally {
      setLoading(false);
    }
    return null;
  };

  return {
    loading,
    requestPermissions,
    pickFromLibrary,
    takePhoto,
  };
};
