import { Text, View } from 'react-native';

import CoreLayout from '~/layouts/CoreLayout';

const SettingsScreen = () => {
  return (
    <CoreLayout showBack showHeaderOptions showNotificationsOnly>
      <View className="m-6 flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Settings</Text>
      </View>
    </CoreLayout>
  );
};

export default SettingsScreen;
