import { useSetAtom } from 'jotai';
import { Text, TouchableOpacity, View } from 'react-native';

import { currencyAtom, currentTxAtom, initialTx, walletBalanceAtom } from '~/atoms';
import { WalletDetails } from '~/components';
import { useAuth } from '~/contexts/AuthContext';
import { useWallet } from '~/hooks/useWallet';
import CoreLayout from '~/layouts/CoreLayout';

const SettingsScreen = () => {
  const setTxAtom = useSetAtom(currentTxAtom);
  const setWbAtom = useSetAtom(walletBalanceAtom);
  const setCurrencyAtom = useSetAtom(currencyAtom);
  const { logout } = useAuth();

  const { wallet, walletAddress, deleteWallet } = useWallet();

  const handleLogout = async () => {
    await new Promise((resolve): void => {
      setTxAtom(initialTx);
      setWbAtom({ success: false, balance: 0 });
      setCurrencyAtom('XRP');
      deleteWallet();
      logout();
      resolve(null);
    });
  };

  return (
    <CoreLayout showBack>
      <View className="m-6 flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Settings</Text>
        {!!walletAddress && (
          <WalletDetails
            address={walletAddress}
            publicKey={wallet!.publicKey}
            seed={wallet!.seed}
          />
        )}
        <View className="absolute bottom-4 flex w-full">
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-8 rounded-lg border-2 border-red-700 px-6 py-3">
            <Text className="text-center text-xl font-semibold text-red-700">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default SettingsScreen;
