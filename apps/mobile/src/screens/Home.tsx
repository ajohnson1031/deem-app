import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '~/types';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-8 text-4xl font-bold text-black">Welcome to Deem</Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('AuthGate')}
        className="mb-4 w-full rounded bg-green-600 py-4">
        <Text className="text-center text-lg font-semibold text-white">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Signup')}
        className="w-full rounded border border-green-600 py-4">
        <Text className="text-center text-lg font-semibold text-green-600">Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
