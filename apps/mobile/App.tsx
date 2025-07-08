import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Provider as JotaiProvider, useSetAtom } from 'jotai';
import { verifyInstallation } from 'nativewind';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';

import { appReadyAtom } from '~/atoms';
import { AuthProvider } from '~/contexts/AuthContext';
import AppNavigator from '~/navigation';
import { toastConfig } from '~/utils';

import './global.css';

verifyInstallation();

export default function App() {
  const setAppReady = useSetAtom(appReadyAtom);
  const [fontsLoaded] = useFonts({
    'Inter-Light': require('./assets/fonts/Inter/static/Inter_24pt-Light.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter/static/Inter_24pt-Medium.ttf'),
    Inter: require('./assets/fonts/Inter/static/Inter_24pt-Regular.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter/static/Inter_24pt-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter/static/Inter_24pt-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-semtext-lg text-gray-800">Loading fonts…</Text>
      </View>
    );
  }

  return (
    <JotaiProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast config={toastConfig} />
        <StatusBar style="auto" />
      </AuthProvider>
    </JotaiProvider>
  );
}
