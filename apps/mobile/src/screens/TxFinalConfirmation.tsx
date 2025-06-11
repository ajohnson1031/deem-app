// TxFinalConfirmationScreen.tsx
import { useAtom, useSetAtom } from 'jotai';
import { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

import { txSessionAuthorizedAtom } from '~/atoms/session';
import { currentTxAtom } from '~/atoms/transaction';
import PinInputField from '~/components/PinInputField';
import CoreLayout from '~/layouts/CoreLayout';
import { useSessionResetCountdown } from '~/utils/feedback';
import { submitXrplTransaction } from '~/utils/xrpl';

const TxFinalConfirmationScreen = () => {
  const [tx, setTx] = useAtom(currentTxAtom);
  const setTxAuthorized = useSetAtom(txSessionAuthorizedAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);
  const shakeRef = useRef(new Animated.Value(0)).current;
  const { CountdownDisplay } = useSessionResetCountdown(
    txSuccess === true ? 'success' : txSuccess === false ? 'fail' : '',
    5
  );

  console.log(tx);

  const handlePinComplete = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const result = await submitXrplTransaction(tx);
      if (result?.success) {
        setTxSuccess(true);
        setTxAuthorized(true);
        setTx({ ...tx, status: 'pending' });
      } else {
        setTxSuccess(false);
      }
    } catch (e) {
      console.log(e);
      setTxSuccess(false);
      setTx({ ...tx, status: 'declined' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CoreLayout
      showBack
      showFooter={false}
      showHeaderOptions={false}
      containerClassName={tx.type === 'PAY' ? 'bg-green-600' : 'bg-sky-700'}
      theme="LIGHT">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-6 text-2xl font-semibold text-gray-800">Confirm Pin</Text>

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
    </CoreLayout>
  );
};

export default TxFinalConfirmationScreen;
