import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { MenuListItem } from '~/components';
import { useAuth } from '~/contexts/AuthContext';
import { CoreLayout } from '~/layouts';
import { MenuIconType, RootStackParamList } from '~/types';

const SecurityScreen = () => {

  const { user } = useAuth();
  const twoFactorEnabled = user?.twoFactorEnabled || false;


  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <CoreLayout showBack title="Security & Privacy">
      <View className="mx-6 flex-1">
        <MenuListItem
          iconType={MenuIconType.MATERIAL_COMM}
          iconName="scan-helper"
          labelText="Security Lock"
          helperText="Biometric input settings"
          chevronText="Off"
          hasBackground
          onPress={() => {}}
        />

        <MenuListItem
          iconType={MenuIconType.MATERIAL_COMM}
          iconName="monitor-screenshot"
          iconSize={22}
          labelText="Login Activity"
          helperText="Manage device access and sessions"
          chevronText="7"
          hasBackground
          onPress={() => {}}
        />

        <MenuListItem
          iconType={MenuIconType.MATERIAL}
          iconName="do-not-disturb-alt"
          iconSize={22}
          labelText="Blocked Accounts"
          helperText="Block/Unblock user transactions"
          hasBackground
          onPress={() => {}}
        />

        <MenuListItem
          iconType={MenuIconType.OCTICONS}
          iconName="shield-lock"
          iconSize={22}
          labelText="Two-Factor Authentication"
          helperText="Secure your wallet and funds"
          chevronText={twoFactorEnabled ? 'On' : 'Off'}
          hasBackground
          onPress={() => {}}
        />
      </View>
    </CoreLayout>
  );
};

export default SecurityScreen;
