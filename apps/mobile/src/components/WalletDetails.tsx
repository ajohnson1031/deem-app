import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const WalletDetails = ({
  address,
  publicKey,
  seed,
}: {
  address: string;
  publicKey: string;
  seed?: string;
}) => {
  const [showSeed, setShowSeed] = useState(false);

  const copyToClipboard = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: `${label} copied`,
      position: 'top',
      topOffset: 60,
    });
  };

  return (
    <View className="mt-6 flex w-full gap-y-4">
      <Text className="text-xl font-semibold">Wallet Details</Text>

      <View className="w-full rounded bg-gray-100 p-3">
        <Text className="text-xs text-gray-500">Classic Address</Text>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-mono">{address}</Text>
          <TouchableOpacity onPress={() => copyToClipboard('Address', address)}>
            <MaterialIcons name="content-copy" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="rounded bg-gray-100 p-3">
        <Text className="text-xs text-gray-500">Public Key</Text>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-mono">{publicKey}</Text>
          <TouchableOpacity onPress={() => copyToClipboard('Public Key', publicKey)}>
            <MaterialIcons name="content-copy" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="rounded bg-gray-100 p-3">
        <Text className="text-md mb-1 text-gray-500">Private Key</Text>
        <View className="flex-row items-center justify-between">
          {seed && (
            <Text className="flex-1 font-mono">{showSeed ? seed : '•'.repeat(seed.length)}</Text>
          )}
          <View className="flex-row gap-x-3">
            <TouchableOpacity onPress={() => setShowSeed((prev) => !prev)}>
              <MaterialIcons
                name={showSeed ? 'visibility-off' : 'visibility'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
            {seed && showSeed && (
              <TouchableOpacity onPress={() => copyToClipboard('Private Key', seed)}>
                <MaterialIcons name="content-copy" size={20} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default WalletDetails;
