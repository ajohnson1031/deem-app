import cn from 'classnames';
import { useSetAtom } from 'jotai';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { currentTxAtom, initialTx, recipientAtom } from '~/atoms/';
import { useSessionResetCountdown } from '~/hooks';
import { CoreLayout } from '~/layouts';
import { TxSubmissionScreenProps } from '~/types';
import { formatFloatClean, formatWithCommas, submitStandardTransaction } from '~/utils';

const TxSubmissionScreen = ({ route, navigation }: TxSubmissionScreenProps) => {
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);
  const setTx = useSetAtom(currentTxAtom);
  const setRecipient = useSetAtom(recipientAtom);

  const { tx, recipient } = route.params;
  const { name } = recipient;

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
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

      try {
        const result = await submitStandardTransaction({
          ...tx,
          status: 'PENDING',
          timestamps: {
            ...(tx.timestamps ?? {}),
            createdAt: Date.now(),
          },
        });

        if (result?.success) {
          setTxSuccess(true);
        } else {
          setTxSuccess(false);
        }
      } catch (e) {
        console.log('Transaction error:', e);
        setTxSuccess(false);
      } finally {
        setIsSubmitting(false);
        setRecipient(null);
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
            <Text className="mt-4 text-lg text-slate-500">Submitting transaction...</Text>
          </View>
        ) : (
          <View className="mx-6 mt-10">
            <Text className="text-5xl font-semibold text-stone-900">
              {txSuccess ? 'Transaction\nSuccessful' : 'Transaction\nFailed'}
            </Text>
            <Text className="mt-2 text-2xl text-gray-700">
              {txSuccess
                ? `Your ${tx.type.toLowerCase()} of ${
                    tx.currency === 'USD'
                      ? `$${formatWithCommas(formatFloatClean(tx.amount))}`
                      : `${formatWithCommas(formatFloatClean(tx.amount))} XRP`
                  }\n${tx.type === 'PAYMENT' ? 'to' : 'from'} ${name} is pending approval.`
                : `Your ${tx.type.toLowerCase()} ${tx.type === 'PAYMENT' ? 'to' : 'from'} ${name} could not be submitted.`}
            </Text>
            <CountdownDisplay />
          </View>
        )}
      </View>
    </CoreLayout>
  );
};

export default TxSubmissionScreen;
