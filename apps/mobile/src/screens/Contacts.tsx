import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
  contactsAtom,
  currencyAtom,
  currentTxAtom,
  recipientAtom,
  suggestedContactsAtom,
} from '~/atoms';
import { Container } from '~/components';
import ContactListItem from '~/components/ContactListItem';
import { Contact, RootStackParamList } from '~/types';
import { formatFloatClean, formatWithCommas } from '~/utils';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ContactScreen = ({ navigation }: Props) => {
  const [tx, setTx] = useAtom(currentTxAtom);
  const [recipient, setRecipient] = useAtom(recipientAtom);
  const currency = useAtomValue(currencyAtom);
  const contacts = useAtomValue(contactsAtom);
  const suggestedContacts = useAtomValue(suggestedContactsAtom);

  const [search, setSearch] = useState(() => {
    const selected = contacts.find((c) => c.id === tx.recipientId);
    return selected?.name || '';
  });

  const buttonText = tx.type === 'PAYMENT' ? 'Pay' : 'Request';

  const filteredContacts: Contact[] = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    if (!val) {
      setTx((prev) => ({ ...prev, recipientId: undefined }));
      setRecipient(null);
    }
  };

  const handleSelect = (contact: Contact) => {
    if (tx.recipientId !== contact.id) {
      setTx((prev) => ({ ...prev, recipientId: contact.id }));
      setRecipient(contact);
      setSearch(contact.name);
    } else {
      setTx((prev) => ({ ...prev, recipientId: undefined }));
      setRecipient(null);
      setSearch('');
    }
  };

  const handleMemo = (val: string) => {
    setTx((prev) => ({ ...prev, memo: val.length ? val : undefined }));
  };

  const handleNav = (screen: 'Send' | 'TxConfirmation') => {
    if (screen === 'Send') {
      setTx((prev) => ({ ...prev, memo: undefined, recipientId: undefined }));
      setRecipient(null);
      navigation.navigate('Send');
    } else {
      if (!tx || !recipient) return;
      navigation.navigate('TxConfirmation', { tx, recipient });
    }
  };

  return (
    <Container>
      <View className="m-6 flex-1">
        {/* Header */}
        <View className="mb-4 flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => handleNav('Send')} className="min-w-[40px]">
            <FontAwesome6 name="arrow-left-long" size={20} />
          </TouchableOpacity>

          {/* Amount */}
          <View className="flex-1 flex-row items-baseline justify-center gap-0.5">
            {currency === 'USD' && <Text className="text-2xl font-semibold">$</Text>}
            <Text className="text-2xl font-semibold">
              {formatWithCommas(formatFloatClean(tx.amount))}
            </Text>
            {currency === 'XRP' && <Text className="text-md font-semibold">{currency}</Text>}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            className={cn('min-w-20 rounded-full px-5 py-2', {
              'bg-green-600': tx.type === 'PAYMENT',
              'bg-sky-600': tx.type === 'REQUEST',
              'opacity-40': !tx.recipientId || !tx.memo,
            })}
            disabled={!tx.recipientId || !tx.memo}
            onPress={() => handleNav('TxConfirmation')}>
            <Text className="text-center text-xl font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        </View>

        {/* To Field */}
        <View className="flex flex-row items-baseline gap-x-2 border-t border-gray-300 pt-4">
          <Text className="text-xl font-semibold">To</Text>
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Name or @username"
            placeholderTextColor="#777"
            className="mb-4 w-[92.5%] px-3 font-medium"
            style={{ fontSize: 18, lineHeight: 22 }}
          />
        </View>

        {/* Memo Field */}
        <View className="mb-4 flex flex-row items-baseline gap-x-2 border-y border-gray-300 pt-4">
          <Text className="text-xl font-semibold">For</Text>
          <TextInput
            value={tx.memo || ''}
            onChangeText={handleMemo}
            placeholder="Memo (required)"
            placeholderTextColor="#777"
            className="mb-4 w-[92.5%] px-3 font-medium"
            style={{ fontSize: 18, lineHeight: 22 }}
          />
        </View>

        {/* Suggested Contacts */}
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

        {/* All Contacts */}
        <Text className="mb-2 text-xl font-semibold text-gray-600">All Contacts</Text>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
