import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtom, useSetAtom } from 'jotai';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { currentTxAtom, txSessionAuthorizedAtom } from '~/atoms';
import { initialTx } from '~/atoms/transaction';
import { useSessionResetCountdown } from '~/hooks';
import CoreLayout from '~/layouts/CoreLayout';
import { RootStackParamList } from '~/types';
import { submitStandardTransaction, submitXrplTransaction } from '~/utils/';

const TxSubmissionScreen = () => {
  const [tx, setTx] = useAtom(currentTxAtom);
  const setTxAuthorized = useSetAtom(txSessionAuthorizedAtom);
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { CountdownDisplay } = useSessionResetCountdown(
    txSuccess === true ? 'success' : txSuccess === false ? 'fail' : '',
    3,
    () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Wallet' }],
      });
      setTimeout(() => {
        setTx({ ...initialTx });
      }, 100);
    }
  );

  useEffect(() => {
    const submitTransaction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const txFunc = tx.type === 'PAYMENT' ? submitXrplTransaction : submitStandardTransaction;
      try {
        const result = await txFunc(tx);
        if (result?.success) {
          setTxSuccess(true);
          setTxAuthorized(true);
        } else {
          setTxSuccess(false);
        }
      } catch (e) {
        console.log('Transaction error:', e);
        setTxSuccess(false);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitTransaction();
  }, []);

  return (
    <CoreLayout>
      <View className={cn('mt-6 flex-1 px-6', { 'justify-center': isSubmitting })}>
        {isSubmitting ? (
          <View className="items-center">
            <LottieView
              source={require('~/../assets/animations/loading-spinner.json')}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
          </View>
        ) : (
          <View className="mx-6 mt-10">
            <Text className="text-5xl font-semibold text-stone-900">
              {txSuccess ? 'Transaction\nSuccessful' : 'Transaction\nFailed'}
            </Text>
            <Text className="text-2xl">{`Your ${tx.type.toLowerCase()} was received.`}</Text>
            <CountdownDisplay />
          </View>
        )}
      </View>
    </CoreLayout>
  );
};

export default TxSubmissionScreen;
