import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import cn from 'classnames';
import { useAtom } from 'jotai';
import { Text, TouchableOpacity, View } from 'react-native';

import { currentTxAtom } from '~/atoms/transaction';
import TxContactListItem from '~/components/TxContactListItem';
import { RootStackParamList } from '~/types/navigation';
import { capitalize } from '~/utils';
import { formatWithCommas } from '~/utils/format';

const TxConfirmationScreen = () => {
  const [tx] = useAtom(currentTxAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { type, amount, memo, recipient } = tx;
  const txLabel = type === 'PAY' ? 'Pay To:' : 'Request From:';
  const title = type === 'PAY' ? 'Confirm Payment?' : 'Confirm Request?';

  const handleBackPress = () => {
    navigation.navigate('Contacts');
  };

  return (
    <View className="flex-1 justify-center gap-y-4  py-20">
      <Text className="mx-8 text-4xl font-normal text-stone-900">{title}</Text>

      <TxContactListItem recipient={recipient!} label={txLabel} />

      {/* Amount Display */}
      <View className="mx-6 rounded-lg p-3">
        <Text className="mb-2 font-medium text-stone-900">Tx. Amount:</Text>
        <View className="flex flex-row items-baseline rounded-lg bg-black/10 p-3">
          <Text className="text-5xl text-stone-900">{formatWithCommas(amount)}</Text>
          <Text className="text-xl font-semibold text-stone-900">XRP</Text>
        </View>
      </View>

      {/* Memo Display */}
      <View className="mx-6 rounded-lg p-3">
        <Text className="mb-2 font-medium text-stone-900">For:</Text>
        <View className="flex flex-row items-baseline rounded-lg bg-black/10 p-3">
          <Text className="text-xl font-semibold text-stone-900">{memo}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex flex-row justify-center gap-x-5">
        <TouchableOpacity
          onPress={() => navigation.navigate('Contacts')}
          className="flex w-2/5 flex-row items-center justify-center gap-2 rounded-full border-2 border-stone-900 py-4">
          <FontAwesome6 name="arrow-left-long" size={20} color="#1c1917" />
          <Text className="text-xl font-bold text-stone-900">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBackPress}
          className={cn('flex w-2/5 flex-row items-center justify-center gap-2 rounded-full py-4', {
            'bg-green-500': type === 'PAY',
            'bg-red-500': type === 'REQUEST',
          })}>
          <Text className="text-xl font-bold text-white">{capitalize(type)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TxConfirmationScreen;
