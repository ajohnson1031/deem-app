import { useSetAtom } from 'jotai';
import { Text, TouchableOpacity, View } from 'react-native';

import { currencyAtom, currentTxAtom, initialTx, walletBalanceAtom } from '~/atoms';
import CoreLayout from '~/layouts/CoreLayout';

const SettingsScreen = ({ onLogout }: { onLogout: () => void }) => {
  const setTxAtom = useSetAtom(currentTxAtom);
  const setWbAtom = useSetAtom(walletBalanceAtom);
  const setCurrencyAtom = useSetAtom(currencyAtom);

  const handleLogout = async () => {
    await new Promise((resolve): void => {
      setTxAtom(initialTx);
      setWbAtom({ success: false, balance: 0 });
      setCurrencyAtom('XRP');
      resolve(null);
    });
    onLogout();
  };

  return (
    <CoreLayout showBack>
      <View className="m-6 flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Settings</Text>
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
