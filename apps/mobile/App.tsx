import 'react-native-get-random-values';

import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { verifyInstallation } from 'nativewind';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import AppNavigator from '~/navigation';
import { toastConfig } from '~/utils';
import './global.css';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Light': require('./assets/fonts/Inter/static/Inter_24pt-Light.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter/static/Inter_24pt-Medium.ttf'),
    Inter: require('./assets/fonts/Inter/static/Inter_24pt-Regular.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter/static/Inter_24pt-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter/static/Inter_24pt-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading fonts...</Text>
      </View>
    );
  }
  verifyInstallation();

  return (
    <>
      <AppNavigator />
      <Toast config={toastConfig} />
      <StatusBar style="auto" />
    </>
  );
}
