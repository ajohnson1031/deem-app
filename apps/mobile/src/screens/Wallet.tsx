import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { WalletDetails } from '~/components';
import { useWallet } from '~/hooks/useWallet';
import CoreLayout from '~/layouts/CoreLayout';

const WalletScreen = ({ onLogout }: { onLogout: () => void }) => {
  const { wallet, walletAddress, walletBalance, createWallet, refreshBalance, loading } =
    useWallet();
  console.log('this is the wallet address', walletAddress); // TODO: Remove log
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Loading wallet...</Text>
      </View>
    );
  }

  return (
    <CoreLayout showFooter showBack={false}>
      <View className="m-6 flex-1 items-center justify-center">
        <Text className="mb-4 text-lg font-bold">Your XRP Wallet</Text>

        {walletAddress ? (
          <View className="flex flex-col gap-y-6 border">
            <View className="flex flex-col items-center gap-y-2">
              <Text className="font-medium text-blue-600">{walletAddress}</Text>
              <Text className="mt-4 text-lg font-bold">Balance:</Text>
              <Text className="text-2xl font-bold text-green-500">
                {walletBalance?.balance ?? 0} XRP
              </Text>
            </View>

            <TouchableOpacity
              onPress={refreshBalance}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2">
              <Text className="font-bold text-white">Refresh Balance</Text>
            </TouchableOpacity>

            <WalletDetails
              address={walletAddress}
              publicKey={wallet!.publicKey}
              seed={wallet!.seed}
            />

            <TouchableOpacity onPress={createWallet} className="rounded-xl bg-red-500 px-4 py-2">
              <Text className="font-bold text-white">Regenerate Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onLogout} className="mt-8 rounded bg-red-500 px-6 py-3">
              <Text className="font-bold text-white">Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={createWallet} className="rounded-xl bg-blue-600 px-6 py-3">
            <Text className="font-bold text-white">Create Wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    </CoreLayout>
  );
};

export default WalletScreen;
