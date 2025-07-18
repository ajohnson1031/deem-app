import { API_BASE_URL } from '@env';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { currencyAtom, currentTxAtom, initialTx, walletBalanceAtom } from '~/atoms';
import { AvatarPicker, ConfirmLogoutModal, ImagePickerModal, MenuListItem } from '~/components';
import { useAuth } from '~/contexts/AuthContext';
import { useImagePicker, useWallet } from '~/hooks';
import { CoreLayout } from '~/layouts';
import { MenuIconType, RootStackParamList } from '~/types';
import { deleteAvatar, uploadAvatar } from '~/utils';
import { api } from '~/utils/api';

const SettingsScreen = () => {
  const setTxAtom = useSetAtom(currentTxAtom);
  const setWbAtom = useSetAtom(walletBalanceAtom);
  const setCurrencyAtom = useSetAtom(currencyAtom);
  const { logout, user, setUser: setStoredUser } = useAuth();
  const { deleteWallet } = useWallet();
  const { requestPermissions, takePhoto, pickFromLibrary } = useImagePicker();

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { id, name, avatarUri, username } = user!;

  const splitName = name?.split(' ') || ['', ''];
  const [firstname, lastname] = [splitName[0], splitName[splitName.length - 1] || ''];
  const initials = `${firstname[0]}${lastname[0] || ''}`;

  const openImagePicker = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera and media access are needed.');
      return;
    }
    setImageModalVisible(true);
  };

  const handleChoosePhoto = async () => {
    const result = await pickFromLibrary();
    if (result) {
      handleUpdateAvatar(result);
    }
    setImageModalVisible(false);
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      handleUpdateAvatar(result);
    }
    setImageModalVisible(false);
  };

  const handleRemovePhoto = async () => {
    const avatarDeleted = await deleteAvatar(avatarUri!);

    if (avatarDeleted) {
      try {
        await api.patch(`${API_BASE_URL}/me`, { avatarUri: null });
        const { avatarUri, ...rest } = user!;
        setStoredUser({ ...rest });
        setImageModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Photo Removed',
          text2: 'You can now upload a new one.',
        });
      } catch (err: any) {
        console.error(err, '\n', err.details);
        setImageModalVisible(false);
        Toast.show({
          type: 'error',
          text1: 'Problem Removing Photo',
          text2: err.error || err.message || 'Unknown error.',
        });
      }
    }
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

  const handleUpdateAvatar = async (result: { uri: string }) => {
    try {
      const avatarUrl = await uploadAvatar(result.uri);
      if (avatarUrl) {
        const res = await api.patch(`${API_BASE_URL}/me`, { avatarUri: avatarUrl });
        const { updatedUser } = res.data;

        setStoredUser((prev) => ({
          ...prev!,
          avatarUri: updatedUser.avatarUri,
        }));

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Profile photo updated.',
        });
      }
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Problem updating profile photo.',
        text2: err.error || err.message || 'Unknown error',
      });
    }
  };

  return (
    <CoreLayout
      showBack
      showLogout
      onLogoutPress={() => setLogoutModalVisible(true)}
      title="Settings">
      <ImagePickerModal
        visible={imageModalVisible}
        avatarUri={avatarUri}
        onChoosePhoto={handleChoosePhoto}
        onTakePhoto={handleTakePhoto}
        onRemovePhoto={handleRemovePhoto}
        onCancel={() => setImageModalVisible(false)}
      />

      <ConfirmLogoutModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />

      <View className="mx-6 flex-1">
        {/* Avatar */}
        <AvatarPicker
          id={id}
          avatarUri={avatarUri}
          initials={initials}
          isLoggedIn
          onPress={openImagePicker}
        />

        <Text className="text-5xl font-semibold">{firstname}</Text>
        <Text className="my-3 w-fit self-start rounded-full bg-gray-200 px-4 py-1 text-lg font-medium">
          @{username}
        </Text>

        <View className="my-3 flex h-[1px] bg-gray-200" />

        <View className="h-3/5">
          <ScrollView persistentScrollbar className="pb-20">
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
              labelText={avatarUri ? 'Update Photo' : 'Add a photo!'}
              helperText={
                avatarUri
                  ? 'New look? Show the community.'
                  : 'Photos help friends find you quicker.'
              }
              hasBackground
              onPress={openImagePicker}
            />

            <MenuListItem
              iconType={MenuIconType.FONT_AWESOME6}
              iconName="wallet"
              labelText="Manage Wallet"
              helperText="Your wallet, your way."
              hasBackground
              onPress={() => navigation.navigate('ManageWallet')}
            />

            <MenuListItem
              iconType={MenuIconType.MATERIAL_COMM}
              iconName="bank"
              iconSize={22}
              labelText="Linked Bank(s)"
              helperText="Partner with the institutions you trust."
              hasBackground
              onPress={() => {}}
            />

            <MenuListItem
              iconType={MenuIconType.MATERIAL_COMM}
              iconName="security"
              iconSize={24}
              labelText="Security"
              helperText="Safety first, always."
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
                  <Text className="text-xl font-medium">Widen Your Circle</Text>
                  <Text className="text-md text-gray-600">Deem your friends worthy.</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </CoreLayout>
  );
};

export default SettingsScreen;
