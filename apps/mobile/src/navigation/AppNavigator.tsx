import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuth } from '~/contexts/AuthContext';
import { useWallet } from '~/hooks/useWallet';
import {
  CardsScreen,
  ContactScreen,
  ConversionsScreen,
  Convert,
  FeePolicyScreen,
  ForgotPasswordScreen,
  HomeScreen,
  PendingTransactionsScreen,
  RegisterScreen,
  SendScreen,
  SettingsScreen,
  TxConfirmationScreen,
  TxHistoryScreen,
  TxSubmissionScreen,
  VerifyPasswordResetScreen,
  WalletScreen,
} from '~/screens';
import { RootStackParamList } from '~/types';
import { emitter } from '~/utils';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { walletAddress } = useWallet();
  const { isLoading, user } = useAuth();
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    const unsub = () => {
      emitter.on('logout', () => {
        setNavKey((k) => k + 1); // force nav reset
      });
    };

    return () => emitter.off('logout', unsub);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <LottieView
          source={require('~/../assets/animations/loading-spinner.json')}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
        <Text className="mt-4 text-lg text-gray-500">Checking login status...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer key={navKey}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}>
          {!user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="VerifyPasswordReset" component={VerifyPasswordResetScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Wallet" component={WalletScreen} />
              <Stack.Screen name="Send" component={SendScreen} />
              <Stack.Screen name="Cards" component={CardsScreen} />
              <Stack.Screen
                name="Convert"
                component={Convert}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }}
              />
              <Stack.Screen name="TxHistory">
                {() => <TxHistoryScreen address={walletAddress!} />}
              </Stack.Screen>
              <Stack.Screen name="Contacts" component={ContactScreen} />
              <Stack.Screen name="TxConfirmation" component={TxConfirmationScreen} />
              <Stack.Screen name="TxSubmission" component={TxSubmissionScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="PendingTransactions" component={PendingTransactionsScreen} />
              <Stack.Screen
                name="FeePolicy"
                component={FeePolicyScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
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
