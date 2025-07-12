import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { contactsAtom, pendingTransactionsAtom } from '~/atoms';
import SwipeableTransactionRow from '~/components/SwipeableTransactionRow';
import { CoreLayout } from '~/layouts';
import { Contact } from '~/types';

const PendingTransactionsScreen = () => {
  const contacts = useAtomValue(contactsAtom);
  const pendingTxs = useAtomValue(pendingTransactionsAtom);

  const contactMap = useMemo(() => {
    const map: Record<string, Contact> = {};
    contacts.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [contacts]);

  return (
    <CoreLayout showBack>
      <ScrollView className="flex-1 px-6 pb-6">
        <Text className="text-2xl font-medium text-gray-800">Pending Requests</Text>
        <Text className="text-md mb-6">Swipe right to approve; left to decline.</Text>
        {pendingTxs.length === 0 ? (
          <Text className="mt-12 text-center text-slate-500">No pending transactions.</Text>
        ) : (
          <View className="gap-2">
            {pendingTxs.map((tx) => {
              const contact = contactMap[tx.recipientId!];
              if (!contact) return null;

              return (
                <SwipeableTransactionRow
                  key={tx.id}
                  transaction={tx}
                  contact={contact}
                  // TODO: Make API call and Update transactions atom
                  onApprove={(tx) => console.log('Approved:', tx.id)}
                  onDeny={(tx) => console.log('Denied:', tx.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </CoreLayout>
  );
};

export default PendingTransactionsScreen;
