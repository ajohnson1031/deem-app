import { Text, View } from 'react-native';

import CoreLayout from '~/layouts/CoreLayout';

const Cards = () => {
  return (
    <CoreLayout showHeaderOptions showFooter>
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Cards</Text>
      </View>
    </CoreLayout>
  );
};

export default Cards;
