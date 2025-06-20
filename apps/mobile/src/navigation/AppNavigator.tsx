import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSetAtom } from 'jotai';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { txSessionAuthorizedAtom } from '~/atoms';
import { useWallet } from '~/hooks/useWallet';
import {
  CardsScreen,
  ContactScreen,
  ConversionsScreen,
  Convert,
  FeePolicyScreen,
  HomeScreen,
  PendingTransactionsScreen,
  PinEntryScreen,
  PinSetupScreen,
  SendScreen,
  SettingsScreen,
  SignupScreen,
  TxConfirmationScreen,
  TxHistoryScreen,
  TxSubmissionScreen,
  WalletScreen,
} from '~/screens';
import { RootStackParamList } from '~/types';
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
        <LottieView
          source={require('~/../assets/animations/loading-spinner.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
        <Text className="mt-4 text-gray-600">Authenticating...</Text>
        {errorMessage && <Text className="mt-2 text-sky-700">{errorMessage}</Text>}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}>
          {!authenticated ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="AuthGate">
                {() => <AuthGate onAuthSuccess={() => setAuthenticated(true)} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Send" component={SendScreen} />
              <Stack.Screen name="Cards" component={CardsScreen} />
              <Stack.Screen name="Wallet" component={WalletScreen} />
              <Stack.Screen
                name="Convert"
                component={Convert}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                  headerShown: false,
                }}
              />
              <Stack.Screen name="TxHistory">
                {() => <TxHistoryScreen address={walletAddress!} />}
              </Stack.Screen>
              <Stack.Screen name="Contacts" component={ContactScreen} />
              <Stack.Screen name="TxConfirmation" component={TxConfirmationScreen} />
              <Stack.Screen name="TxSubmission" component={TxSubmissionScreen} />
              <Stack.Screen name="Settings">
                {() => <SettingsScreen onLogout={() => setAuthenticated(false)} />}
              </Stack.Screen>
              <Stack.Screen name="PendingTransactions" component={PendingTransactionsScreen} />
              <Stack.Screen
                name="FeePolicy"
                component={FeePolicyScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                  headerShown: false,
                }}
              />
              <Stack.Screen name="Conversions" component={ConversionsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
