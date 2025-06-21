import cn from 'classnames';
import { Image, Text, View } from 'react-native';

import { Contact, Transaction, TxListType } from '~/types';
import { capitalize, getColorIndex } from '~/utils';

const TxListItem = ({
  transaction,
  listType,
  contact,
}: {
  transaction: Transaction;
  listType: TxListType;
  contact: Contact;
}) => {
  const { name, avatarUrl, id } = contact;

  const split = name?.split(' ') ?? [];
  const [first = '', last = ''] = [split[0], split[split.length - 1]];
  const bgColor = getColorIndex(id);

  const { type, direction, amount, memo } = transaction;
  const amountClassName =
    direction === 'INCOMING' && type === 'PAYMENT' ? 'text-green-600' : 'text-red-600';
  const amountSymbol = direction === 'INCOMING' && type === 'PAYMENT' ? '+' : '-';

  return (
    <View
      className={cn('flex rounded-xl bg-white py-4', {
        'bg-[#fff]': ['DRAFT', 'PENDING'].includes(transaction.status ?? ''),
      })}>
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
            <Text className="text-2xl font-normal text-white">{`${first[0] ?? ''}${last[0] ?? ''}`}</Text>
          </View>
        )}
        <View className="flex flex-1 flex-row items-center justify-between">
          <View className="flex justify-center">
            <Text className="text-xl font-semibold">{`${first} ${last}`}</Text>
            <Text className="text-lg font-normal">{capitalize(memo ?? '')}</Text>
          </View>

          {listType === 'TX' && (
            <Text className={cn('text-xl font-medium', amountClassName)}>
              {`${amountSymbol}${amount}`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default TxListItem;
