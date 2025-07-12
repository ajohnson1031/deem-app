import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import LabelFieldWithCopy from '~/components/LabelFieldWithCopy';
import { useFlashScrollIndicators } from '~/hooks';
import { LabelFieldWithCopyVariant } from '~/types';

const WalletDetails = ({
  address,
  publicKey,
  seed,
}: {
  address: string;
  publicKey: string;
  seed?: string;
}) => {
  const { scrollViewRef, flashIndicators } = useFlashScrollIndicators();
  const [flashCount, setFlashCount] = useState<number>(0);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      if (flashCount < 4) {
        flashIndicators();
        setFlashCount(flashCount + 1);
      }
    }, 500);

    return () => clearInterval(flashInterval);
  }, [flashCount]);

  return (
    <View className="flex w-full gap-y-4">
      <View className="flex">
        <Text className="text-xl font-semibold text-red-600">Important Note</Text>
        <Text className="text-xl font-semibold text-slate-600">About Crypto Wallets</Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        className="flex h-44 pr-4"
        showsVerticalScrollIndicator
        persistentScrollbar>
        <Text className="text-lg text-slate-600">
          The values you see listed below &mdash; your
          <Text className="font-medium italic text-slate-600"> Wallet Address</Text>,
          <Text className="font-medium italic text-slate-600"> Public Key &</Text>
          <Text className="font-medium italic text-red-600"> Seed</Text> are the core elements that
          make up your crypto wallet. Sharing the wallet address is encouraged, as it is the primary
          vector for sending & receiving funds to or from your wallet. Your public key may also be
          shared without deleterious effect.
        </Text>
        <Text className="my-3 text-lg text-slate-600">
          Your seed should <Text className="font-bold text-red-600">never</Text> be shared.
        </Text>
        <Text className="text-lg text-slate-600">
          If your seed is compromised, it can be used to derive your private key and sign
          transactions you did not in fact authorize and/or drain your wallet of funds. If you must
          unmask your seed, please ensure privacy in your immediate surroundings and store it
          quickly & securely, away from prying eyes.
        </Text>
        <Text className="mt-3 text-lg text-slate-600">
          You are responsible for safeguarding your wallet's seed. Deem does not claim any
          responsibility if it leaks due to actions on your part.
        </Text>
      </ScrollView>

      <View className="my-3 flex h-[1px] bg-gray-200" />
      <ScrollView>
        <LabelFieldWithCopy
          className="my-2"
          label="Wallet Address"
          value={address ?? ''}
          valueKey="wallet"
          copiedMessage="Wallet Address Copied!"
        />
        <LabelFieldWithCopy
          className="my-2"
          label="Public Key"
          value={publicKey ?? ''}
          valueKey="publicKey"
          copiedMessage="Public Key Copied!"
        />
        <LabelFieldWithCopy
          className="my-2"
          label={
            <View className="flex-row">
              <Text className="text-red-600">*</Text>
              <Text className="text-sm font-semibold text-slate-500">Seed</Text>
            </View>
          }
          value={seed ?? ''}
          valueKey="seed"
          copiedMessage="Seed Copied!"
          variant={LabelFieldWithCopyVariant.MASKED}
        />

        <TouchableOpacity className="mt-2 flex-row items-center justify-center gap-2 rounded-lg bg-sky-600 py-4">
          <Text className="text-center text-xl font-medium text-white">Export Wallet</Text>
          <Feather name="download" color="white" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default WalletDetails;
