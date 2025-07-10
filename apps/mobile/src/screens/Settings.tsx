import { Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { randomUUID } from 'expo-crypto';
import { useSetAtom } from 'jotai';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { currencyAtom, currentTxAtom, initialTx, walletBalanceAtom } from '~/atoms';
import { MenuListItem } from '~/components';
import { MenuIconType } from '~/components/MenuListItem';
import { useAuth } from '~/contexts/AuthContext';
import { useWallet } from '~/hooks/useWallet';
import CoreLayout from '~/layouts/CoreLayout';
import { getColorIndex } from '~/utils';

const SettingsScreen = () => {
  const setTxAtom = useSetAtom(currentTxAtom);
  const setWbAtom = useSetAtom(walletBalanceAtom);
  const setCurrencyAtom = useSetAtom(currencyAtom);
  const { logout, user } = useAuth();
  const { deleteWallet } = useWallet();
  // wallet, walletAddress,
  const { id, name, avatarUrl, username } = user || {};
  const splitName = name?.split(' ') || ['', ''];
  const [firstname, lastname] = [splitName[0], splitName[1] || ''];
  const backgroundColor = getColorIndex(id || randomUUID());

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
      <View className="mx-6 flex-1">
        {/* Avatar */}
        <View className="mb-3 h-28">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-24 w-24 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <TouchableOpacity>
              <View
                className="h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor }}>
                <Text className="text-3xl font-medium text-white">
                  {firstname[0]}
                  {lastname[0] || ''}
                </Text>
              </View>
              <View className="relative bottom-9 left-16 flex items-center justify-center self-start rounded-full border-2 border-white bg-gray-200 p-2">
                <FontAwesome name="camera" size={22} color="#4b5563" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-5xl font-semibold">{firstname}</Text>
        <Text className="my-3 w-fit self-start rounded-full bg-gray-200 px-4 py-1 text-lg font-medium">
          @{username}
        </Text>

        <MenuListItem
          iconType={MenuIconType.FEATHER}
          iconName="edit-2"
          labelText="Edit Basic Info"
          helperText="You've changed. Help us stay current."
          hasBackground
          onPress={() => {}}
        />

        <MenuListItem
          iconType={MenuIconType.FONT_AWESOME}
          iconName="camera"
          labelText={avatarUrl ? 'Update your snapshot' : 'Add a picture!'}
          helperText="Photos help friends find you quicker."
          hasBackground
          onPress={() => {}}
        />

        <MenuListItem
          iconType={MenuIconType.FONT_AWESOME6}
          iconName="wallet"
          labelText="Export Wallet"
          helperText="Store wallet details or regenerate."
          hasBackground
          onPress={() => {}}
        />

        <MenuListItem
          iconType={MenuIconType.FONT_AWESOME}
          iconName="bank"
          labelText="Linked Bank(s)"
          helperText="Set where funds get sent."
          hasBackground
          onPress={() => {}}
        />

        {/* Invite Friends Button */}
        <TouchableOpacity className="flex-row items-center justify-between py-3" onPress={() => {}}>
          <View className="flex-row items-center gap-4">
            <View className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <Feather name="plus" size={32} color="white" />
            </View>
            <View>
              <Text className="text-xl font-medium">Widen your circle</Text>
              <Text className="text-md text-gray-600">Deem your friends worthy</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={16} />
        </TouchableOpacity>

        {/* {!!walletAddress && (
          <WalletDetails
            address={walletAddress}
            publicKey={wallet!.publicKey}
            seed={wallet!.seed}
          />
        )} */}

        <View className="absolute bottom-4 flex w-full">
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-8 rounded-lg bg-gray-200 px-6 py-3">
            <Text className="text-center text-xl font-medium text-red-700">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default SettingsScreen;
