import { Text, View } from 'react-native';

import { CoreLayout } from '~/layouts';

const Conversions = () => {
  return (
    <CoreLayout showBack>
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Conversions</Text>
      </View>
    </CoreLayout>
  );
};

export default Conversions;
