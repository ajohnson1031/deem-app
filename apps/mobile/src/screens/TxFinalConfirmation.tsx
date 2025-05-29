// TxFinalConfirmationScreen.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

import { txSessionAuthorizedAtom } from '~/atoms/session';
import { currentTxAtom } from '~/atoms/transaction';
import PinInputField from '~/components/PinInputField';
import { useSessionResetCountdown } from '~/utils/feedback';
import { submitXrplTransaction } from '~/utils/xrpl';

const TxFinalConfirmationScreen = () => {
  const tx = useAtomValue(currentTxAtom);
  const setTxAuthorized = useSetAtom(txSessionAuthorizedAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);
  const shakeRef = useRef(new Animated.Value(0)).current;
  const { CountdownDisplay } = useSessionResetCountdown(
    txSuccess === true ? 'success' : txSuccess === false ? 'fail' : '',
    5
  );

  const handlePinComplete = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const result = await submitXrplTransaction(tx);
      if (result?.success) {
        setTxSuccess(true);
        setTxAuthorized(true);
      } else {
        setTxSuccess(false);
      }
    } catch (e) {
      console.log(e);
      setTxSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-6 text-2xl font-semibold text-gray-800">Confirm Transaction</Text>

      {txSuccess === null ? (
        <PinInputField onPinComplete={handlePinComplete} shakeRef={shakeRef} />
      ) : (
        <View className="items-center">
          {isSubmitting && <ActivityIndicator size="large" color="#4ade80" />}
          <Text className="mt-4 text-base font-medium text-gray-700">
            {txSuccess === true && 'Transaction submitted successfully!'}
            {txSuccess === false && 'Transaction failed. Please try again.'}
          </Text>
          <CountdownDisplay />
        </View>
      )}
    </View>
  );
};

export default TxFinalConfirmationScreen;
