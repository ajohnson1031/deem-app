import { useAtomValue } from 'jotai';
import { FlatList, Text, View } from 'react-native';

import { transactionsAtom } from '~/atoms';
import { TxListItem } from '~/components';
import CoreLayout from '~/layouts/CoreLayout';

const TxHistory = ({ address }: { address: string }) => {
  const transactions = useAtomValue(transactionsAtom);
  // TODO: Uncomment when ready for real data
  // const [transactions, setTransactions] = useState<any[]>([]);
  // const [marker, setMarker] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  // const [loadingMore, setLoadingMore] = useState(false);

  // useEffect(() => {
  //   const fetchInitial = async () => {
  //     const { transactions, marker } = await getTransactionHistory(address);
  //     setTransactions(transactions);
  //     setMarker(marker);
  //     setLoading(false);
  //   };

  //   fetchInitial();
  // }, [address]);

  // const fetchMore = async () => {
  //   if (!marker || loadingMore) return;

  //   setLoadingMore(true);
  //   const { transactions: moreTxs, marker: newMarker } = await getTransactionHistory(
  //     address,
  //     marker
  //   );
  //   setTransactions((prev) => [...prev, ...moreTxs]);
  //   setMarker(newMarker);
  //   setLoadingMore(false);
  // };

  // if (loading) return <ActivityIndicator className="mt-4" />;

  return (
    <CoreLayout showHeaderOptions showFooter showBack={false}>
      <View className="mx-6 flex flex-1">
        <Text className="mb-4 text-2xl font-medium text-gray-800">
          Transactions ({transactions.length})
        </Text>
        {!!transactions.length && (
          <FlatList
            className="flex-1"
            data={transactions}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={{ paddingVertical: 8, paddingRight: 12 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => <TxListItem type="TX" transaction={item} />}
          />
          // <FlatList
          //   className="my-6 flex flex-1 gap-2 overflow-auto"
          //   contentContainerStyle={{ paddingBottom: 32 }}
          //   data={transactions}
          //   keyExtractor={(item) => item.hash!}
          // TODO: Uncomment when ready for real data
          // onEndReached={fetchMore}
          // onEndReachedThreshold={0.5}
          // ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" /> : null}
          // renderItem={({ item }) => (
          //   <TxListItem key={item.id!} type="TX" transaction={item} />
          // TODO: Uncomment when ready for real data
          // <View className="mb-4 rounded border border-gray-300 p-4">
          //   <Text className="font-bold">{item.type}</Text>
          //   <Text>{item.amount ? `Amount: ${item.amount}` : 'No amount'}</Text>
          //   <Text className="text-sm text-gray-500">Hash: {item.hash.slice(0, 10)}...</Text>
          //   <Text className="text-sm text-gray-500">
          //     Status: {item.success ? '✅ Success' : '❌ Failed'}
          //   </Text>
          // </View>
          // )}
          // />
        )}
      </View>
    </CoreLayout>
  );
};

export default TxHistory;
