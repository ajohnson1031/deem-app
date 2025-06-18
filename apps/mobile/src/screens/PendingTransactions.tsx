import { useAtomValue } from 'jotai';
import { ScrollView, Text, View } from 'react-native';

import { pendingTransactionsAtom } from '~/atoms';
import { SwipeableTransactionRow } from '~/components';
import CoreLayout from '~/layouts/CoreLayout';

const PendingTransactionsScreen = () => {
  const pendingTxs = useAtomValue(pendingTransactionsAtom);

  return (
    <CoreLayout showBack showHeaderOptions showSettingsOnly showFooter={false}>
      <ScrollView className="flex-1 px-6 pb-6">
        <Text className="text-2xl font-medium text-gray-800">Pending Requests</Text>
        <Text className="text-md mb-6">Swipe right to approve; left to decline.</Text>
        {pendingTxs.length === 0 ? (
          <Text className="mt-12 text-center text-gray-500">No pending transactions.</Text>
        ) : (
          <View className="gap-2">
            {pendingTxs.map((tx) => (
              <SwipeableTransactionRow
                key={tx.id}
                transaction={tx}
                // TODO: Make API call and Update transactions atom
                onApprove={(tx) => console.log('Approved:', tx.id)}
                onDeny={(tx) => console.log('Denied:', tx.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </CoreLayout>
  );
};

export default PendingTransactionsScreen;
