import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { contactsAtom, currencyAtom, currentTxAtom, suggestedContactsAtom } from '~/atoms';
import { Container } from '~/components';
import ContactListItem from '~/components/ContactListItem';
import { Contact, RootStackParamList } from '~/types';
import { formatWithCommas } from '~/utils';

const ContactScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) => {
  const [tx, setTx] = useAtom(currentTxAtom);
  const currency = useAtomValue(currencyAtom);
  const contacts = useAtomValue(contactsAtom);
  const suggestedContacts = useAtomValue(suggestedContactsAtom);
  const [search, setSearch] = useState(
    tx.recipientId ? contacts.filter((contact) => contact.id === tx.recipientId)[0].name : ''
  );
  const buttonWidth = tx.type === 'PAYMENT' ? 'w-10' : 'w-20';
  const buttonText = tx.type === 'PAYMENT' ? 'Pay' : 'Request';

  const filteredContacts: Contact[] = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (val: string) => {
    if (!val) {
      setTx((prev) => ({ ...prev, recipientId: undefined }));
    }
    setSearch(val);
  };

  const handleSelect = (contact: Contact) => {
    if (tx.recipientId !== contact.id) {
      setTx((prev) => ({ ...prev, recipientId: contact.id }));
      setSearch(contact.name);
    } else {
      setTx((prev) => ({ ...prev, recipientId: undefined }));
      setSearch('');
    }
  };

  const handleMemo = (val: string) => {
    setTx((prev) => ({ ...prev, memo: val.length ? val : undefined }));
  };

  const handleNav = (screenName: any) => {
    if (screenName === 'Send') {
      setTx((prev) => ({ ...prev, memo: undefined, recipientId: undefined }));
    }
    navigation.navigate(screenName, { tx });
  };

  return (
    <Container>
      <View className="m-6 flex-1">
        <View className="mb-4 flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => handleNav('Send')} className={buttonWidth}>
            <FontAwesome6 name="arrow-left-long" size={20} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-baseline justify-center gap-0.5">
            {currency === 'USD' && <Text className="text-2xl font-semibold">$</Text>}
            <Text className="text-2xl font-semibold">{formatWithCommas(tx.amount)}</Text>
            {currency === 'XRP' && <Text className="text-md font-semibold">{currency}</Text>}
            {/* // TODO: Add USD value */}
          </View>

          <TouchableOpacity
            className={cn('rounded-full px-5 py-2', {
              'bg-green-600': tx.type === 'PAYMENT',
              'bg-sky-600': tx.type === 'REQUEST',
              buttonWidth,
              'opacity-40': !tx.recipientId || !tx.memo,
            })}
            disabled={!tx.recipientId || !tx.memo}
            onPress={() => handleNav('TxConfirmation')}>
            <Text className=" text-xl font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-baseline gap-x-2 border-t border-gray-300 pt-4">
          <Text className="text-xl font-semibold">To</Text>
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Name or @username"
            placeholderTextColor="#777"
            className="mb-4 w-[92.5%] px-3 font-medium"
            style={{
              fontSize: 18,
              lineHeight: 22,
              paddingTop: 0, // adjust as needed
              paddingBottom: 0, // adjust as needed
            }}
          />
        </View>

        <View className="mb-4 flex flex-row items-baseline gap-x-2 border-y border-gray-300 pt-4">
          <Text className="text-xl font-semibold">For</Text>
          <TextInput
            value={tx.memo || ''}
            onChangeText={handleMemo}
            placeholder="Memo (required)"
            placeholderTextColor="#777"
            className="mb-4 w-[92.5%] px-3 font-medium"
            style={{
              fontSize: 18,
              lineHeight: 22,
              paddingTop: 0, // adjust as needed
              paddingBottom: 0, // adjust as needed
            }}
          />
        </View>

        <Text className="mb-4 text-xl font-semibold text-gray-600">Suggested</Text>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4 border-b border-gray-300 pb-4">
            {suggestedContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                isSuggested
                onPress={() => handleSelect(contact)}
              />
            ))}
          </ScrollView>
        </View>

        <Text className="mb-2 text-xl font-semibold text-gray-600">All Contacts</Text>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Contact }) => (
            <View className="my-3">
              <ContactListItem
                contact={item}
                isSuggested={false}
                onPress={() => handleSelect(item)}
              />
            </View>
          )}
        />
      </View>
    </Container>
  );
};

export default ContactScreen;
