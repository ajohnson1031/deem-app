import cn from 'classnames';
import { Image, Text, View } from 'react-native';

import { Transaction, TxListType } from '~/types';
import { capitalize, useGetContact } from '~/utils';

const ConfirmationItem = ({ contactId }: { contactId: string }) => {
  const { matchedContact, name, bgColor } = useGetContact(contactId);
  const { avatarUrl, username } = matchedContact;
  const [first, last] = name;

  return (
    <View className="flex rounded-xl bg-white p-4">
      <View className="flex flex-row gap-4">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-16 w-16 rounded-full"
            onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
          />
        ) : (
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: bgColor }}>
            <Text className="text-3xl font-normal text-stone-900">{`${first[0]}${last[0]}`}</Text>
          </View>
        )}
        <View className="flex justify-center">
          <Text className="text-xl font-semibold text-stone-900">{`${first} ${last}`}</Text>
          <Text className="text-lg font-normal text-stone-900/70">{username}</Text>
        </View>
      </View>
    </View>
  );
};

const TxItem = ({ transaction }: { transaction: Transaction }) => {
  // TODO: structure props around actual return data
  const { matchedContact, name, bgColor } = useGetContact(transaction.recipientId!);
  const { avatarUrl } = matchedContact;
  const [first, last] = name;

  const { type, direction, amount, memo } = transaction;
  const amountClassName =
    direction === 'incoming' && type === 'PAYMENT' ? 'text-green-600' : 'text-red-600';
  const amountSymbol = direction === 'incoming' && type === 'PAYMENT' ? '+' : '-';

  return (
    <View className="flex rounded-xl bg-white py-4">
      <View className="flex flex-row gap-4 px-4">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-16 w-16 rounded-full"
            onError={(e: any) => console.log('Error Loading Image', e.nativeEvent)}
          />
        ) : (
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: bgColor }}>
            <Text className="text-2xl font-normal text-white">{`${first[0]}${last[0]}`}</Text>
          </View>
        )}
        <View className="flex flex-1 flex-row items-center justify-between">
          <View className="flex justify-center">
            <Text className="text-xl font-semibold">{`${first} ${last}`}</Text>
            <Text className="text-lg font-normal">{capitalize(memo!)}</Text>
          </View>

          <Text
            className={cn(
              'text-xl font-medium',
              amountClassName
            )}>{`${amountSymbol}${amount}`}</Text>
        </View>
      </View>
    </View>
  );
};

const TxListItem = ({
  contactId,
  transaction,
  type,
}: {
  contactId?: string;
  transaction?: Transaction;
  type: TxListType;
}) => {
  return type === 'TX' ? (
    <TxItem transaction={transaction!} />
  ) : (
    <ConfirmationItem contactId={contactId!} />
  );
};

export default TxListItem;
