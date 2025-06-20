import { format, isSameMonth } from 'date-fns';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { SectionList, Text, TextInput, View } from 'react-native';

import { contactsAtom, transactionsAtom } from '~/atoms';
import { TxListItem } from '~/components';
import CoreLayout from '~/layouts/CoreLayout';
import { Transaction } from '~/types';

const TxHistory = ({ address }: { address: string }) => {
  // TODO: Get tx data from API calls
  const transactions = useAtomValue(transactionsAtom);
  const contacts = useAtomValue(contactsAtom);
  const [search, setSearch] = useState('');

  const contactMap = useMemo(() => {
    const map: Record<string, { name?: string; username?: string }> = {};
    contacts.forEach((c) => {
      map[c.id] = { name: c.name, username: c.username };
    });
    return map;
  }, [contacts]);

  const filteredTxs = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      const memoMatch = tx.memo?.toLowerCase().includes(search.toLowerCase());
      const amountMatch = tx.amount.includes(search);
      const dateMatch = tx.timestamp?.toString().includes(search.toLowerCase());

      const contact = contactMap[tx.recipientId!];
      const nameMatch = contact?.name?.toLowerCase().includes(search.toLowerCase());
      const usernameMatch = contact?.username?.toLowerCase().includes(search.toLowerCase());

      return memoMatch || amountMatch || dateMatch || nameMatch || usernameMatch;
    });
  }, [transactions, contactMap, search]);

  const sections = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};

    const now = new Date();

    filteredTxs.forEach((tx) => {
      const date = new Date(tx.timestamp!);

      // Use 'This month' if the transaction is in the current month
      const key = isSameMonth(date, now) ? 'This month' : format(date, 'MMMM yyyy');

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(tx);
    });

    return Object.entries(grouped)
      .sort(
        (a, b) => new Date(b[1][0].timestamp!).getTime() - new Date(a[1][0].timestamp!).getTime()
      )
      .map(([title, data]) => ({ title, data }));
  }, [filteredTxs]);

  return (
    <CoreLayout showHeaderOptions showFooter>
      <View className="mx-6 flex-1">
        <Text className="mb-4 text-2xl font-medium text-gray-800">Activity</Text>
        <View className="rounded-lg bg-gray-100 p-3 py-4">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search txs"
            placeholderTextColor="#777"
            className="w-[92.5%] font-medium"
            style={{
              fontSize: 18,
              lineHeight: 22,
              paddingTop: 0, // adjust as needed
              paddingBottom: 0, // adjust as needed
            }}
          />
        </View>
        {sections.length > 0 && (
          <SectionList
            sections={sections}
            keyExtractor={(item: Transaction) => item.id!}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }: { item: Transaction }) => (
              <TxListItem listType="TX" transaction={item} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View className="bg-white pb-2 pt-6">
                <Text className="text-xl font-semibold text-gray-700">{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </CoreLayout>
  );
};

export default TxHistory;
