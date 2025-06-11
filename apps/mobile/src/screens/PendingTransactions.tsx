import { useAtomValue } from 'jotai';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { pendingTransactionsAtom } from '~/atoms/transaction';
import CoreLayout from '~/layouts/CoreLayout';

const PendingTransactionsScreen = () => {
  const pendingTxs = useAtomValue(pendingTransactionsAtom);

  return (
    <CoreLayout showBack showHeaderOptions showSettingsOnly showFooter={false}>
      <ScrollView className="flex-1 px-4 pb-6">
        <Text className="mb-4 text-lg font-bold text-gray-800">Pending Transactions</Text>
        {pendingTxs.length === 0 ? (
          <Text className="mt-12 text-center text-gray-500">No pending transactions.</Text>
        ) : (
          <View className="gap-4">
            {pendingTxs.map((tx) => (
              <View
                key={tx.id}
                className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
                <Text className="text-base font-semibold text-gray-800">
                  {tx.type === 'PAY' ? 'Payment' : 'Request'}{' '}
                  {tx.direction === 'incoming' ? 'from' : 'to'} {tx.contactId}
                </Text>
                <Text className="mt-1 text-lg font-bold text-stone-900">${tx.amount}</Text>
                {tx.memo && <Text className="mt-1 text-sm italic text-gray-600">"{tx.memo}"</Text>}
                <View className="mt-3 flex-row gap-2">
                  <TouchableOpacity className="flex-1 rounded bg-green-500 py-2" onPress={() => {}}>
                    <Text className="text-center font-bold text-white">Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 rounded bg-red-500 py-2" onPress={() => {}}>
                    <Text className="text-center font-bold text-white">Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </CoreLayout>
  );
};

export default PendingTransactionsScreen;
