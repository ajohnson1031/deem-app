import { Text, View } from 'react-native';

import CoreLayout from '~/layouts/CoreLayout';

const RegisterScreen = () => {
  return (
    <CoreLayout showBack>
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Register</Text>
      </View>
    </CoreLayout>
  );
};

export default RegisterScreen;
