import { FC } from 'react';
import { Text, View } from 'react-native';

const Home: FC = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-600">Welcome to XRPay 💸</Text>
    </View>
  );
};

export default Home;
