// App.tsx
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Provider as JotaiProvider, useSetAtom } from 'jotai';
import { verifyInstallation } from 'nativewind';
import { useEffect } from 'react';
import { AppState, Text, View } from 'react-native';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';

import { appReadyAtom, appStateAtom } from '~/atoms';
import { ScreenCaptureGuard } from '~/components';
import { AuthProvider } from '~/contexts/AuthContext';
import AppNavigator from '~/navigation';
import { globalStore } from '~/state/store';
import { toastConfig } from '~/utils';
import './global.css';

verifyInstallation();

function InnerApp() {
  const setAppReady = useSetAtom(appReadyAtom);
  const setAppState = useSetAtom(appStateAtom); // ✅

  const [fontsLoaded] = useFonts({
    'Inter-Light': require('./assets/fonts/Inter/static/Inter_24pt-Light.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter/static/Inter_24pt-Medium.ttf'),
    Inter: require('./assets/fonts/Inter/static/Inter_24pt-Regular.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter/static/Inter_24pt-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter/static/Inter_24pt-Bold.ttf'),
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState); // ✅ sync state

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
      console.log('✅ Fonts loaded. appReady set to true');
    } else {
      console.log('❌ Fonts not yet loaded');
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
    <AuthProvider>
      <AppNavigator />
      <Toast config={toastConfig} />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ScreenCaptureGuard>
      <JotaiProvider store={globalStore}>
        <InnerApp />
      </JotaiProvider>
    </ScreenCaptureGuard>
  );
}
