import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import CoreLayout from '~/layouts/CoreLayout';
import { getTransactionHistory } from '~/utils';

const TxHistory = ({ address }: { address: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      const { transactions, marker } = await getTransactionHistory(address);
      setTransactions(transactions);
      setMarker(marker);
      setLoading(false);
    };

    fetchInitial();
  }, [address]);

  const fetchMore = async () => {
    if (!marker || loadingMore) return;

    setLoadingMore(true);
    const { transactions: moreTxs, marker: newMarker } = await getTransactionHistory(
      address,
      marker
    );
    setTransactions((prev) => [...prev, ...moreTxs]);
    setMarker(newMarker);
    setLoadingMore(false);
  };

  if (loading) return <ActivityIndicator className="mt-4" />;

  return (
    <CoreLayout showHeaderOptions showFooter showBack={false}>
      <Text className="text-lg font-bold">Transactions ({transactions.length})</Text>
      {!!transactions.length && (
        <FlatList
          className="bg-gray-400"
          data={transactions}
          keyExtractor={(item) => item.hash}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" /> : null}
          renderItem={({ item }) => (
            <View className="mb-4 rounded border border-gray-300 p-4">
              <Text className="font-bold">{item.type}</Text>
              <Text>{item.amount ? `Amount: ${item.amount}` : 'No amount'}</Text>
              <Text className="text-sm text-gray-500">Hash: {item.hash.slice(0, 10)}...</Text>
              <Text className="text-sm text-gray-500">
                Status: {item.success ? '✅ Success' : '❌ Failed'}
              </Text>
            </View>
          )}
        />
      )}
    </CoreLayout>
  );
};

export default TxHistory;
