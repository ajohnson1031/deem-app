import Feather from '@expo/vector-icons/Feather';
import { ReactNode, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { WalletDetails } from '~/components';
import { useFlashScrollIndicators, useWallet } from '~/hooks';
import { CoreLayout } from '~/layouts';

const ManageWalletScreen = () => {
  const { wallet, walletAddress } = useWallet();
  const { scrollViewRef, flashIndicators } = useFlashScrollIndicators();
  const [flashCount, setFlashCount] = useState<number>(0);

  const VIEWS: Record<string, string | ReactNode>[] = [
    {
      headerText: 'Current Wallet Details',
      component: (
        <View>
          {!!walletAddress && (
            <View>
              <Text className="mb-6 text-lg leading-snug text-slate-600">
                Import or export your wallet details using a secure, encrypted file. Confirming the
                import overwrites the currently stored wallet. Please be sure to copy and store your
                current wallet details before doing so.
              </Text>
              <WalletDetails
                address={walletAddress}
                publicKey={wallet!.publicKey}
                seed={wallet!.seed}
              />
            </View>
          )}
        </View>
      ),
    },
    {
      headerText: 'Update Wallet Manually',
      component: (
        <View>
          {!!walletAddress && (
            <WalletDetails
              address={walletAddress}
              publicKey={wallet!.publicKey}
              seed={wallet!.seed}
            />
          )}
        </View>
      ),
    },
    {
      headerText: 'Regenerate Wallet',
      component: (
        <View>
          {!!walletAddress && (
            <WalletDetails
              address={walletAddress}
              publicKey={wallet!.publicKey}
              seed={wallet!.seed}
            />
          )}
        </View>
      ),
    },
  ];

  const [currentViewIndex, setCurrentViewIndex] = useState<number>(0);

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
    <CoreLayout showBack title="Manage Wallet">
      <View className="mx-6">
        <View className="flex">
          <Text className="text-2xl font-semibold text-red-600">Important Note</Text>
          <Text className="text-2xl font-semibold text-slate-600">About Crypto Wallets</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="my-3 flex max-h-36 pr-4"
          showsVerticalScrollIndicator
          persistentScrollbar>
          <Text className="text-lg text-slate-600">
            Your
            <Text className="font-medium italic text-slate-600"> Wallet Address</Text>,
            <Text className="font-medium italic text-slate-600"> Public Key &</Text>
            <Text className="font-medium italic text-red-600"> Seed</Text> are the core elements
            making up your crypto wallet. Sharing the wallet address is encouraged, as it is the
            primary vector for sending & receiving funds to or from your wallet. Your public key may
            also be shared without deleterious effect.
          </Text>
          <Text className="my-3 text-lg text-slate-600">
            Your seed, however, should <Text className="font-bold text-red-600">never</Text> be
            shared.
          </Text>
          <Text className="text-lg text-slate-600">
            If your seed is compromised, it can be used to derive your private key and sign
            transactions you did not in fact authorize and/or drain your wallet of funds. If you
            must unmask your seed, please ensure privacy in your immediate surroundings and store it
            quickly & securely, away from prying eyes.
          </Text>
          <Text className="mt-3 text-lg text-slate-600">
            You are responsible for safeguarding your wallet's seed. Deem does not claim any
            responsibility if it leaks due to actions on your part.
          </Text>
        </ScrollView>
      </View>

      <View className="mx-6 mb-4 flex-row justify-between border-y border-gray-200 py-3">
        <Text className="text-lg font-medium text-slate-600">
          {VIEWS[currentViewIndex].headerText}
        </Text>

        <View className="flex-row items-center gap-2">
          <Text className="font-bold text-slate-600">
            {`${currentViewIndex + 1}`}
            <Text className="font-normal"> / 3</Text>
          </Text>
          <View className="w-16 flex-row items-center justify-between gap-2">
            <TouchableOpacity
              className="rounded-lg bg-gray-100 p-1.5"
              onPress={() => setCurrentViewIndex(currentViewIndex - 1)}
              disabled={currentViewIndex < 1}>
              <Feather name="chevron-left" size={16} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg bg-gray-100 p-1.5"
              onPress={() => setCurrentViewIndex(currentViewIndex + 1)}
              disabled={currentViewIndex >= VIEWS.length - 1}>
              <Feather name="chevron-right" size={16} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="mx-6 flex flex-1 justify-between">
        <View>{VIEWS[currentViewIndex].component}</View>
      </View>
    </CoreLayout>
  );
};

export default ManageWalletScreen;
