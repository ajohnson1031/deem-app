import { Text, View } from 'react-native';

import CoreLayout from '~/layouts/CoreLayout';

const SignupScreen = () => {
  return (
    <CoreLayout showBack={false} showHeaderOptions={false} showFooter={false}>
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Signup</Text>
      </View>
    </CoreLayout>
  );
};

export default SignupScreen;
