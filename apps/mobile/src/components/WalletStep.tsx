import { Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Wallet, isValidClassicAddress } from 'xrpl';

import { useCopyToClipboard } from '~/hooks';

interface StepTwoWalletProps {
  onComplete: (wallet: { walletAddress: string; seed: string }) => void;
  onCancel: () => void;
}

const StepTwoWallet = ({ onComplete, onCancel }: StepTwoWalletProps) => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [seed, setSeed] = useState<string | undefined>();
  const [generated, setGenerated] = useState(false);
  const [isUsingOwnWallet, setIsUsingOwnWallet] = useState<boolean>(false);
  const { copiedKey, copy } = useCopyToClipboard();
  const isValidWalletAddress = walletAddress ? isValidClassicAddress(walletAddress.trim()) : false;
  const isValidSeed = (() => {
    try {
      Wallet.fromSeed(seed!.trim());
      return true;
    } catch {
      return false;
    }
  })();

  const isFormValid = isValidWalletAddress && isValidSeed;

  const handleGenerate = () => {
    const wallet = Wallet.generate();
    setWalletAddress(wallet.classicAddress);
    setSeed(wallet.seed!);
    setGenerated(true);
    setIsUsingOwnWallet(false);
  };

  const handleSubmit = () => {
    if (!walletAddress || !seed) {
      return;
    }

    onComplete({ walletAddress, seed });
  };

  useEffect(() => {
    setIsUsingOwnWallet(!generated && !!walletAddress && !!seed);
  }, [generated, walletAddress, seed]);

  return (
    <View className="mt-10 flex w-full flex-1 justify-between px-6">
      <View>
        <Text className="text-center text-3xl font-medium text-gray-700">
          Setup Your Deem Wallet
        </Text>
        <View className="mb-10 mt-3 flex h-[1px] bg-gray-200" />
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
              Enter details for a previously created wallet. Your wallet seed will be encrypted to
              maximize safety.{`\n`}
              <Text className="font-semibold text-red-600">
                Raw seeds are never stored or sent to our servers.
              </Text>
            </Text>

            <View className="mb-3 w-full rounded-lg bg-gray-100">
              <TextInput
                className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
                placeholder="Wallet Address"
                placeholderTextColor="#777"
                autoCapitalize="none"
                value={walletAddress}
                onChangeText={(val) => setWalletAddress(val.trim())}
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
                className="m-0 w-10/12 rounded-md border border-gray-200 bg-gray-100 p-3"
                text-xl
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ fontWeight: 500, color: copiedKey === 'wallet' ? '#0284c7' : '#4B5563' }}>
                {copiedKey === 'wallet' ? 'Wallet Address Copied!' : walletAddress}
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
                className="m-0 w-10/12 rounded-md  border border-gray-200 bg-gray-100 p-3"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ fontWeight: 500, color: copiedKey === 'seed' ? '#0284c7' : '#4B5563' }}>
                {copiedKey === 'seed' ? 'Seed Copied!' : seed && '•'.repeat(seed.length)}
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
                Write down and store your seed securely.{`\n`}It will never be displayed again.
                Losing your seed means <Text className=" text-red-600">permanent loss</Text> of the
                associated wallet and all funds within it.
              </Text>
            </View>
          </View>
        )}

        {!isValidWalletAddress && walletAddress && walletAddress.length > 0 && (
          <Text className="mb-2 text-sm text-red-500">Invalid wallet address.</Text>
        )}
        {!isValidSeed && seed && seed.length > 0 && (
          <Text className="mb-2 text-sm text-red-500">Invalid wallet seed.</Text>
        )}
      </View>
      <View className="mb-8 flex-row gap-4">
        <TouchableOpacity
          onPress={onCancel}
          className="mt-4 flex-1 rounded-lg border-2 border-gray-800 py-3">
          <Text className="text-center text-xl font-medium text-gray-800">Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          className={`mt-4 flex-1 rounded-lg py-3 ${isFormValid ? 'bg-sky-600' : 'bg-gray-300'}`}
          disabled={isUsingOwnWallet ? !isFormValid : false}>
          <Text
            className={`text-center text-xl font-medium ${isFormValid ? 'text-white' : 'text-gray-400'}`}>
            Register Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepTwoWallet;
