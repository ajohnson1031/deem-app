import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Wallet } from 'xrpl';

import LabelFieldWithCopy from '~/components/LabelFieldWithCopy';
import PassphrasePromptModal from '~/components/PassphrasePromptModal';
import { useWallet } from '~/hooks';
import { EncryptionModalMode, FieldVariant } from '~/types';
import { decryptAndImport, encryptAndExport } from '~/utils/crypto'; // Use your util path!

const WalletDetails = ({
  address,
  publicKey,
  seed,
}: {
  address: string;
  publicKey: string;
  seed?: string;
}) => {
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [currentMode, setCurrentMode] = useState<EncryptionModalMode>();
  const [importFile, setImportFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { setWallet, saveWallet } = useWallet();

  // Export callback
  const handleExport = async (passphrase: string) => {
    try {
      if (!seed) throw new Error('No wallet seed available!');

      const t0 = Date.now();
      const encrypted = encryptAndExport(passphrase, seed);
      const t1 = Date.now();
      console.log('Encrypting seed 1 took', t1 - t0, 'ms');
      // Save to a temp file

      const fileUri = FileSystem.cacheDirectory + 'deem-wallet-backup.txt';
      await FileSystem.writeAsStringAsync(fileUri, encrypted, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Prompt user to save/share the file
      await Sharing.shareAsync(fileUri, {
        dialogTitle: 'Share or save your encrypted backup file',
        mimeType: 'text/plain',
        UTI: 'public.text',
      });
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  // Import callback
  const handleFilePicker = async () => {
    try {
      // 1. Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || !result.assets.length) return;

      const uri = result.assets[0].uri;

      // 2. Read file contents
      const fileContents = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setImportFile(fileContents);
      // const decryptedSeed = decryptAndImport(passphrase, fileContents);
      // 3. Open passphrase modal
      setShowPassphraseModal(true);
      // Optionally update state, navigate, etc.
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    }
  };

  const handleImport = async (importFile: string, passphrase: string) => {
    try {
      const decryptedSeed = decryptAndImport(passphrase, importFile);
      const wallet = Wallet.fromSeed(decryptedSeed);

      await saveWallet(wallet);

      setWallet(wallet);

      // setShowPassphraseModal(false);

      Toast.show({
        type: 'success',
        text1: 'Updated Wallet Details',
        text2: 'Wallet has been restored from file.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Import Failed',
        text2: error.message,
      });
    }
  };

  const closePassModal = () => {
    setShowPassphraseModal(false);
    setCurrentMode(undefined);
    setIsProcessing(false);
  };

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
        visible={showPassphraseModal}
        isProcessing={isProcessing}
        onCancel={closePassModal}
        onConfirm={async (passphrase: string) => {
          setIsProcessing(true);
          setTimeout(async () => {
            // Heavy work here!
            try {
              if (currentMode === EncryptionModalMode.EXPORT) {
                await handleExport(passphrase);
              } else if (currentMode === EncryptionModalMode.IMPORT) {
                await handleImport(importFile!, passphrase);
              }
            } finally {
              closePassModal();
            }
          }, 50);
        }}
        mode={currentMode}
      />

      <View className="mt-1 flex-row gap-4">
        <TouchableOpacity
          className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-sky-600 py-4"
          onPress={() => {
            setCurrentMode(EncryptionModalMode.IMPORT);
            handleFilePicker();
          }}>
          <Text className="text-center text-xl font-medium text-white">Import</Text>
          <Feather name="upload" color="white" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 flex-1 flex-row items-center justify-center gap-3 rounded-lg bg-slate-600 py-4"
          onPress={() => {
            setCurrentMode(EncryptionModalMode.EXPORT);
            setShowPassphraseModal(true);
          }}>
          <Text className="text-center text-xl font-medium text-white">Export</Text>
          <Feather name="download" color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletDetails;
