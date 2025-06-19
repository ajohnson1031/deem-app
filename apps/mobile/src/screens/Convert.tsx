import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '~/types';

const Convert = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View className=" flex flex-1">
      <View className="absolute left-4 top-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={32} />
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-4xl font-semibold">Convert</Text>
        {/* Your conversion UI goes here */}
      </View>
    </View>
  );
};

export default Convert;
