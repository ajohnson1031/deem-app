import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import LabelFieldWithCopy from '~/components/LabelFieldWithCopy';
import ModalPrompt from '~/components/ModalPrompt';
import { EncryptionModalMode, FieldVariant, ModalPromptVariant } from '~/types';

const WalletDetails = ({
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
}: {
  address: string;
  publicKey: string;
  seed?: string;
  mode?: EncryptionModalMode;
  passphrase: string;
  passphraseModalVisible: boolean;
  isProcessing: boolean;
  onImportPress: () => Promise<void>;
  onExportPress: () => void;
  onChangePassphrase: (text: string) => void;
  onClosePassphraseModal: () => void;
  onConfirm: () => Promise<void>;
  error: string;
}) => {
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

      <View className="mt-1 flex-row gap-4">
        <TouchableOpacity
          className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-sky-600 py-4"
          onPress={onImportPress}>
          <Text className="text-center text-xl font-medium text-white">Import</Text>
          <Feather name="upload" color="white" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-slate-600 py-4"
          onPress={onExportPress}>
          <Text className="text-center text-xl font-medium text-white">Export</Text>
          <Feather name="download" color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletDetails;
