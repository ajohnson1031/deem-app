import { useRef } from 'react';
import { ScrollView } from 'react-native';

export const useFlashScrollIndicators = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const flashIndicators = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current?.flashScrollIndicators();
    }
  };

  return { scrollViewRef, flashIndicators };
};
