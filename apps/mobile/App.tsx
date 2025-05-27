import 'react-native-get-random-values';

import { StatusBar } from 'expo-status-bar';
import { verifyInstallation } from 'nativewind';
import Toast from 'react-native-toast-message';

import AppNavigator from '~/navigation';
import './global.css';

export default function App() {
  verifyInstallation();
  return (
    <>
      <AppNavigator />
      <Toast />
      <StatusBar style="auto" />
    </>
  );
}
