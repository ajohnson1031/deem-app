import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import LabelFieldWithCopy from '~/components/LabelFieldWithCopy';
import PassphrasePromptModal from '~/components/PassphrasePromptModal';
import { FieldVariant, ModalMode } from '~/types';

const WalletDetails = ({
  address,
  publicKey,
  seed,
}: {
  address: string;
  publicKey: string;
  seed?: string;
}) => {
  const [showPassModal, setShowPassModal] = useState(false);
  const [currentMode, setCurrentMode] = useState<ModalMode>();

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

      <PassphrasePromptModal
        visible={showPassModal}
        onConfirm={() => {}} // TODO: Flesh out details of what happens on confirm
        onCancel={() => {
          setShowPassModal(false);
          setCurrentMode(undefined);
        }}
        mode={currentMode}
      />

      <View className="mt-1 flex-row gap-4">
        <TouchableOpacity
          className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-sky-600 py-4"
          onPress={() => {
            setCurrentMode(ModalMode.IMPORT);
            setShowPassModal(true);
          }}>
          <Text className="text-center text-xl font-medium text-white">Import</Text>
          <Feather name="upload" color="white" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-slate-600 py-4"
          onPress={() => {
            setCurrentMode(ModalMode.EXPORT);
            setShowPassModal(true);
          }}>
          <Text className="text-center text-xl font-medium text-white">Export</Text>
          <Feather name="download" color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/*   <TouchableOpacity
            className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-cyan-600 py-4"
            onPress={() => Alert.alert('TODO: Add Regenerate Wallet Function')}>
            <Text className="text-center text-xl font-medium text-white">Regenerate Wallet</Text>
            <Fontisto name="spinner-refresh" size={20} color="white" />
          </TouchableOpacity> */}
    </View>
  );
};

export default WalletDetails;
