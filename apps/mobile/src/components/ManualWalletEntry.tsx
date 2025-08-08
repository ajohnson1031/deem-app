import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ManualWalletEntryProps } from '~/types';

const ManualWalletEntry = ({
  disabled,
  walletAddress,
  seed,
  isValidWalletAddress,
  isValidSeed,
  onChangeWallet,
  onChangeSeed,
  onConfirm,
}: ManualWalletEntryProps) => {
  const isFormValid = isValidWalletAddress && isValidSeed && !disabled;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
      <Text className="mb-6 text-lg leading-snug text-gray-600">
        Manually enter details for any valid XRP wallet. This option allows for the use of wallets
        created in other apps (i.e., XUMM, etc.). The seed you provide will be encrypted to maximize
        safety.&nbsp;
        <Text className="font-semibold text-red-600">
          Raw seeds are never stored or sent to our servers.
        </Text>
      </Text>

      <View className="mb-2 w-full rounded-lg bg-gray-100">
        <TextInput
          className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
          placeholder="Wallet Address"
          placeholderTextColor="#777"
          autoCapitalize="none"
          value={walletAddress}
          onChangeText={onChangeWallet}
        />
      </View>
      {!isValidWalletAddress && walletAddress && walletAddress.length > 0 && (
        <Text className="mb-2 text-sm text-red-600">Invalid wallet address.</Text>
      )}
      <View className="mb-2 w-full rounded-lg bg-gray-100">
        <TextInput
          className="w-full p-3 py-4 text-lg font-medium leading-[18px]"
          placeholder="Seed"
          placeholderTextColor="#777"
          autoCapitalize="none"
          secureTextEntry
          value={seed}
          onChangeText={onChangeSeed}
        />
      </View>

      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={onConfirm}
          className={`mt-4 flex-1 rounded-lg py-4 ${isFormValid ? 'bg-sky-600' : 'bg-gray-300'}`}
          disabled={!isFormValid}>
          <Text
            className={`text-center text-xl font-medium ${isFormValid ? 'text-white' : 'text-gray-400'}`}>
            Update Wallet
          </Text>
        </TouchableOpacity>
      </View>
      {!isValidSeed && seed && seed.length > 0 && (
        <Text className="mb-2 text-sm text-red-600">Invalid seed.</Text>
      )}
    </KeyboardAvoidingView>
  );
};

export default ManualWalletEntry;
