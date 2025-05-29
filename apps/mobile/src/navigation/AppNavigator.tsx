import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { txSessionAuthorizedAtom } from '~/atoms/session';
import { useWallet } from '~/hooks/useWallet';
import {
  ContactScreen,
  PinEntryScreen,
  PinSetupScreen,
  SendScreen,
  SettingsScreen,
  TxConfirmationScreen,
  TxFinalConfirmationScreen,
  TxHistoryScreen,
  WalletScreen,
} from '~/screens';
import { RootStackParamList } from '~/types/navigation';
import { getStoredPin, savePin } from '~/utils';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthGate = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [checking, setChecking] = useState(true);
  const [fallbackToPin, setFallbackToPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pinStep, setPinStep] = useState<'setup' | 'confirm' | null>(null);
  const [tempPin, setTempPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const setSessionAuth = useSetAtom(txSessionAuthorizedAtom);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate',
          });

          if (result.success) {
            setSessionAuth(true);
            onAuthSuccess();
            return;
          }
        }

        const pin = await getStoredPin();
        if (pin) {
          setFallbackToPin(true);
        } else {
          setPinStep('setup');
        }
      } catch (err) {
        setErrorMessage((err as Error).message);
        setPinStep('setup');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600">Authenticating...</Text>
        {errorMessage && <Text className="mt-2 text-red-500">{errorMessage}</Text>}
      </View>
    );
  }

  if (fallbackToPin) {
    return (
      <PinEntryScreen
        onSuccess={() => {
          setSessionAuth(true);
          onAuthSuccess();
        }}
      />
    );
  }

  if (pinStep === 'setup') {
    return (
      <PinSetupScreen
        onComplete={(pin) => {
          setTempPin(pin);
          setPinStep('confirm');
          setPinError(null);
        }}
        errorMessage={pinError}
      />
    );
  }

  if (pinStep === 'confirm') {
    return (
      <PinSetupScreen
        onComplete={async (confirmation) => {
          if (confirmation === tempPin) {
            await savePin(confirmation);
            setSessionAuth(true);
            onAuthSuccess();
          } else {
            setPinError('PINs do not match. Please try again.');
            setTempPin(null);
            setPinStep('setup');
          }
        }}
        errorMessage={pinError}
      />
    );
  }

  return null;
};

export default function AppNavigator() {
  const [authenticated, setAuthenticated] = useState(false);
  const { walletAddress } = useWallet();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        {!authenticated ? (
          <Stack.Screen name="AuthGate">
            {() => <AuthGate onAuthSuccess={() => setAuthenticated(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Send" component={SendScreen} />
            <Stack.Screen name="Wallet">
              {() => <WalletScreen onLogout={() => setAuthenticated(false)} />}
            </Stack.Screen>
            <Stack.Screen name="TxHistory">
              {() => <TxHistoryScreen address={walletAddress!} />}
            </Stack.Screen>
            <Stack.Screen name="Contacts" component={ContactScreen} />
            <Stack.Screen name="TxConfirmation" component={TxConfirmationScreen} />
            <Stack.Screen name="TxFinalConfirmation" component={TxFinalConfirmationScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
