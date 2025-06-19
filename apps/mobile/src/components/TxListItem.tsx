import cn from 'classnames';
import { Image, Text, View } from 'react-native';

import { Transaction, TxListType } from '~/types';
import { capitalize, useGetContact } from '~/utils';

const TxListItem = ({
  transaction,
  listType,
}: {
  transaction: Transaction;
  listType: TxListType;
}) => {
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

          {listType === 'TX' && (
            <Text
              className={cn(
                'text-xl font-medium',
                amountClassName
              )}>{`${amountSymbol}${amount}`}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default TxListItem;
