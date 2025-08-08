import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import LabelFieldWithCopy from '~/components/LabelFieldWithCopy';
import ModalPrompt from '~/components/ModalPrompt';
import { FieldVariant, ModalPromptVariant } from '~/types';
import { WalletDetailsProps } from '~/types/wallet';

const WalletDetails = ({
  disabled,
  address,
  publicKey,
  seed,
  mode,
  passphrase,
  passphraseModalVisible,
  isProcessing,
  onImportPress,
  onExportPress,
  onChangePassphrase,
  onClosePassphraseModal,
  onConfirm,
  error,
}: WalletDetailsProps) => {
  return (
    <View className="flex w-full gap-y-4">
      <View className="flex gap-3">
        <LabelFieldWithCopy
          className="my-2"
          label="Wallet Address"
          value={address ?? ''}
          valueKey="wallet"
          copiedMessage="Wallet Address Copied!"
        />
        <LabelFieldWithCopy
          className="my-2"
          label="Public Key"
          value={publicKey ?? ''}
          valueKey="publicKey"
          copiedMessage="Public Key Copied!"
        />
        <LabelFieldWithCopy
          className="my-2"
          label={
            <View className="flex-row">
              <Text className="text-red-600">*</Text>
              <Text className="text-sm font-semibold text-slate-500">Seed</Text>
            </View>
          }
          value={seed ?? ''}
          requires2fa
          valueKey="seed"
          copiedMessage="Seed Copied!"
          variant={FieldVariant.MASKED}
        />
      </View>
      <ModalPrompt
        value={passphrase}
        onChangeValue={onChangePassphrase}
        variant={ModalPromptVariant.PASSPHRASE}
        visible={passphraseModalVisible}
        isProcessing={isProcessing}
        onCancel={onClosePassphraseModal}
        onConfirm={onConfirm}
        error={error}
        mode={mode}
      />

      <View className="w-full flex-row gap-4">
        <TouchableOpacity
          className="mb-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-sky-600 py-4 disabled:bg-gray-300"
          onPress={onImportPress}
          disabled={disabled}>
          <Text
            className={`text-center text-xl font-medium ${disabled ? 'text-gray-400' : 'text-white'}`}>
            Import
          </Text>
          <Feather name="upload" color={disabled ? '#9ca3af' : 'white'} size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          className="mb-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-slate-600 py-4 disabled:bg-gray-300"
          onPress={onExportPress}
          disabled={disabled}>
          <Text
            className={`text-center text-xl font-medium ${disabled ? 'text-gray-400' : 'text-white'}`}>
            Export
          </Text>
          <Feather name="download" color={disabled ? '#9ca3af' : 'white'} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletDetails;
