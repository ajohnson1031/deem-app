import { Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { currencyAtom, currentTxAtom, initialTx, walletBalanceAtom } from '~/atoms';
import { ImagePickerModal, MenuListItem } from '~/components';
import { useAuth } from '~/contexts/AuthContext';
import { useImagePicker, useWallet } from '~/hooks';
import CoreLayout from '~/layouts/CoreLayout';
import { MenuIconType, RootStackParamList } from '~/types';
import { getColorIndex } from '~/utils';

const SettingsScreen = () => {
  const setTxAtom = useSetAtom(currentTxAtom);
  const setWbAtom = useSetAtom(walletBalanceAtom);
  const setCurrencyAtom = useSetAtom(currencyAtom);
  const { logout, user } = useAuth();
  const { deleteWallet } = useWallet();
  const { requestPermissions, takePhoto, pickFromLibrary } = useImagePicker();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);

  // wallet, walletAddress,
  const { id, name, avatarUri, username } = user || {};
  const splitName = name?.split(' ') || ['', ''];
  const [firstname, lastname] = [splitName[0], splitName[1] || ''];
  const backgroundColor = getColorIndex(id || randomUUID());

  const openImagePicker = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera and media access are needed.');
      return;
    }
    setModalVisible(true);
  };

  const handleChoosePhoto = async () => {
    const result = await pickFromLibrary();
    if (result) {
      // TODO: handle result.url
      // setUserData((prev) => ({ ...prev, avatarUri: result.uri }));
    }
    setModalVisible(false);
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      // TODO: handle result.url
      // setUserData((prev) => ({ ...prev, avatarUri: result.uri }));
    }
    setModalVisible(false);
  };

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
      <ImagePickerModal
        visible={modalVisible}
        onChoosePhoto={handleChoosePhoto}
        onTakePhoto={handleTakePhoto}
        onCancel={() => setModalVisible(false)}
      />

      <View className="mx-6 flex-1">
        {/* Avatar */}
        <View className="mb-3 h-28">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="h-24 w-24 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <TouchableOpacity onPress={openImagePicker}>
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

        <View className="my-3 flex h-[1px] bg-gray-200" />

        <View className="h-3/5">
          <ScrollView showsVerticalScrollIndicator={false}>
            <MenuListItem
              iconType={MenuIconType.FEATHER}
              iconName="edit-2"
              labelText="Edit Basic Info"
              helperText="You've changed. Help us stay current."
              hasBackground
              onPress={() => navigation.navigate('EditBasicInfo')}
            />

            <MenuListItem
              iconType={MenuIconType.FONT_AWESOME}
              iconName="camera"
              labelText={avatarUri ? 'Update your snapshot' : 'Add a picture!'}
              helperText="Photos help friends find you quicker."
              hasBackground
              onPress={openImagePicker}
            />

            <MenuListItem
              iconType={MenuIconType.FONT_AWESOME6}
              iconName="wallet"
              labelText="Wallet Management"
              helperText="Export wallet details, regenerate & more."
              hasBackground
              onPress={() => {}}
            />

            <MenuListItem
              iconType={MenuIconType.MATERIAL_COMM}
              iconName="bank"
              iconSize={22}
              labelText="Linked Bank(s)"
              helperText="Set where funds get sent."
              hasBackground
              onPress={() => {}}
            />

            <MenuListItem
              iconType={MenuIconType.MATERIAL_COMM}
              iconName="security"
              iconSize={24}
              labelText="Security"
              helperText="Manage security settings."
              hasBackground
              onPress={() => {}}
            />

            {/* Invite Friends Button */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              onPress={() => {}}>
              <View className="flex-row items-center gap-4">
                <View className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <Feather name="plus" size={32} color="white" />
                </View>
                <View>
                  <Text className="text-xl font-medium">Widen your circle</Text>
                  <Text className="text-md text-gray-600">Deem your friends worthy.</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} />
            </TouchableOpacity>
          </ScrollView>
        </View>
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
            className="mt-8 rounded-lg bg-gray-200 px-6 py-4">
            <Text className="text-center text-xl font-medium text-red-600">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CoreLayout>
  );
};

export default SettingsScreen;
