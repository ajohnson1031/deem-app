import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { currentTxAtom } from '~/atoms/transaction';
import { Container } from '~/components';
import ContactListItem from '~/components/ContactListItem';
import { MOCK_ALL_CONTACTS, MOCK_SUGGESTED } from '~/mocks/contacts';
import { Contact } from '~/types/contacts';
import { RootStackParamList } from '~/types/navigation';
import { capitalize, formatWithCommas } from '~/utils';

const ContactScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) => {
  const [tx, setTx] = useAtom(currentTxAtom);
  const [search, setSearch] = useState('');
  const buttonWidth = tx.type === 'PAY' ? 'w-10' : 'w-20';

  const filteredContacts: Contact[] = MOCK_ALL_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (contact: Contact) => {
    setTx({ ...tx, recipient: contact });
    setSearch(contact.name);
  };

  const handleMemo = (val: string) => {
    setTx({ ...tx, memo: val.length ? val : null });
  };

  const handleNav = (screenName: any) => {
    if (screenName === 'Send') {
      setTx({ ...tx, memo: null, recipient: {} });
    }

    navigation.navigate(screenName);
  };

  return (
    <Container>
      <View className="flex-1 px-4 py-6">
        <View className="mb-4 flex flex-row justify-between">
          <TouchableOpacity onPress={() => handleNav('Send')} className={buttonWidth}>
            <FontAwesome6 name="arrow-left-long" size={20} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-baseline justify-center gap-0.5">
            <Text className="text-xl font-bold">{formatWithCommas(tx.amount)}</Text>
            <Text className="text-sm font-semibold">XRP</Text>
          </View>

          <TouchableOpacity
            className={cn('rounded-full px-4 py-2', {
              'bg-green-500': tx.type === 'PAY',
              'bg-red-500': tx.type === 'REQUEST',
              buttonWidth,
            })}>
            <Text className="font-semibold text-white">{capitalize(tx.type)}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-baseline gap-x-2 border-t border-gray-300 pt-4">
          <Text className="font-semibold">To</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Name or @username"
            placeholderTextColor="#777"
            className="mb-4 w-[92.5%] px-3 font-semibold"
          />
        </View>

        <View className="mb-4 flex flex-row items-baseline gap-x-2 border-y border-gray-300 pt-4">
          <Text className="font-semibold">For</Text>
          <TextInput
            value={tx.memo || ''}
            onChangeText={handleMemo}
            placeholder="Memo (required)"
            placeholderTextColor="#777"
            className="mb-4 w-[92.5%] px-3"
          />
        </View>

        <Text className="text-medium mb-2 font-semibold text-gray-600">Suggested</Text>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4 border-b border-gray-300 pb-4">
            {MOCK_SUGGESTED.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                isSuggested
                onPress={() => handleSelect(contact)}
              />
            ))}
          </ScrollView>
        </View>

        <Text className="text-medium mb-2 font-semibold text-gray-600">All Contacts</Text>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Contact }) => (
            <ContactListItem
              contact={item}
              isSuggested={false}
              onPress={() => handleSelect(item)}
            />
          )}
        />
      </View>
    </Container>
  );
};

export default ContactScreen;
