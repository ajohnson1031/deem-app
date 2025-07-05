import { Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Wallet } from 'xrpl';

import { useCopyToClipboard } from '~/hooks';

interface StepTwoWalletProps {
  onComplete: (wallet: { walletAddress: string; seed: string }) => void;
  onCancel: () => void;
}

const StepTwoWallet = ({ onComplete, onCancel }: StepTwoWalletProps) => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [seed, setSeed] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [isUsingOwnWallet, setIsUsingOwnWallet] = useState<boolean>(false);
  const { copiedKey, copy } = useCopyToClipboard();

  const handleGenerate = () => {
    const wallet = Wallet.generate();
    setWalletAddress(wallet.classicAddress);
    setSeed(wallet.seed!);
    setGenerated(true);
    setError(null);
    setIsUsingOwnWallet(false);
  };

  const handleSubmit = () => {
    if (!walletAddress || !seed) {
      setError('Wallet address and seed are required.');
      return;
    }

    onComplete({ walletAddress, seed });
  };

  useEffect(() => {
    setIsUsingOwnWallet(!generated && !!walletAddress && !!seed);
  }, [generated, walletAddress, seed]);

  return (
    <View className="w-full px-6">
      <Text className="mb-8 text-center text-4xl font-medium text-black">
        Setup Your Deem Wallet
      </Text>

      {!generated && (
        <>
          <Text className="mb-6 text-lg text-gray-600">
            Let Deem securely create a new wallet for you.
          </Text>
          <TouchableOpacity
            onPress={handleGenerate}
            className={`rounded-lg py-3 ${isUsingOwnWallet ? 'bg-gray-300' : 'bg-emerald-600'}`}
            disabled={isUsingOwnWallet}>
            <Text
              className={`text-center text-xl font-medium ${!isUsingOwnWallet ? 'text-white' : 'text-gray-400'}`}>
              Generate New Wallet
            </Text>
          </TouchableOpacity>
          <View className="my-6 flex w-full flex-row items-center justify-center gap-4">
            <View className="h-[1px] w-2/5 bg-gray-300" />
            <Text className="text-gray-600">Or</Text>
            <View className="h-[1px] w-2/5 bg-gray-300" />
          </View>
          <Text className="mb-6 text-lg text-gray-600">
            Enter details for a previously created wallet. Your seed phrase will be encrypted and
            stored securely to maximize safety.
          </Text>
          <View className="mb-3 w-full rounded-lg bg-gray-100">
            <TextInput
              className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
              placeholder="Wallet Address"
              placeholderTextColor="#777"
              autoCapitalize="none"
              value={walletAddress}
              onChangeText={(val) => {
                setWalletAddress(val);
              }}
              editable={!generated}
            />
          </View>
          <View className="mb-3 w-full rounded-lg bg-gray-100">
            <TextInput
              className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
              placeholder="Wallet Seed"
              placeholderTextColor="#777"
              autoCapitalize="none"
              secureTextEntry={!generated}
              value={seed}
              onChangeText={(val) => {
                setSeed(val);
              }}
              editable={!generated}
            />
          </View>
        </>
      )}

      {generated && (
        <View className="mb-4">
          <Text className="mb-2 text-gray-600">Wallet Address:</Text>
          <View className="mb-4 flex flex-row items-center justify-center gap-2 rounded-lg">
            <Text
              className="m-0 w-10/12 rounded-md border border-gray-200 bg-gray-100 p-3 text-xl"
              text-xl
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontWeight: 500, color: copiedKey === 'wallet' ? '#0284c7' : '#4B5563' }}>
              {copiedKey === 'wallet' ? 'Copied Wallet Address!' : walletAddress}
            </Text>
            <TouchableOpacity
              className="flex w-2/12 flex-1 items-center justify-center rounded-md border border-gray-200  bg-gray-100 p-3.5"
              disabled={!walletAddress}
              onPress={() => copy(walletAddress!, 'wallet')}>
              <Feather name="copy" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <Text className="mb-2 text-gray-600">Wallet Seed:</Text>
          <View className="mb-6 flex flex-row items-center justify-center gap-2 rounded-lg">
            <Text
              className="m-0 w-10/12 rounded-md  border border-gray-200 bg-gray-100 p-3 text-xl"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontWeight: 500, color: copiedKey === 'seed' ? '#0284c7' : '#4B5563' }}>
              {copiedKey === 'seed' ? 'Copied Seed!' : '•'.repeat(seed?.length || 29)}
            </Text>
            <TouchableOpacity
              className="flex w-2/12 flex-1 items-center justify-center rounded-md border border-gray-200  bg-gray-100 p-3.5"
              disabled={!seed}
              onPress={() => copy(seed!, 'seed')}>
              <Feather name="copy" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View className="flex flex-row items-start gap-2">
            <FontAwesome name="warning" size={24} color="orangered" className="mt-1.5" />
            <Text className="w-11/12 text-lg font-semibold">
              Write down and store your seed securely.{`\n`}It will never be displayed again. Losing
              your seed means <Text className=" text-red-600">permanent loss</Text> of the
              associated wallet and all funds within it.
            </Text>
          </View>
        </View>
      )}

      {error && <Text className="mb-3 text-center text-red-500">{error}</Text>}
      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={onCancel}
          className="mt-4 flex-1 rounded-lg border-2 border-gray-800 py-3">
          <Text className="text-center text-xl font-medium text-gray-800">Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          className={`mt-4 flex-1 rounded-lg py-3 ${!!walletAddress && !!seed ? 'bg-sky-600' : 'bg-gray-300'}`}
          disabled={!isUsingOwnWallet}>
          <Text
            className={`text-center text-xl font-medium ${!!walletAddress && !!seed ? 'text-white' : 'text-gray-400'}`}>
            Register Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepTwoWallet;
