import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { Wallet } from 'xrpl';

import { useWallet } from '~/hooks';
import { decryptAndImport, encryptAndExport } from '~/utils/crypto';

const handleExport = async (passphrase: string, seed?: string) => {
  try {
    if (!seed) throw new Error('No wallet seed available!');

    const encrypted = encryptAndExport(passphrase, seed);

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
    Toast.show({
      type: 'success',
      text1: 'Encryption Complete',
      text2: 'Wallet has been exported securely.',
    });
  } catch (err: any) {
    alert('Export failed: ' + err.message);
  }
};

const useHandleImport = () => {
  const { saveWallet, setWallet } = useWallet();

  return async (importFile: string, passphrase: string) => {
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
};

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

    return fileContents;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Import Failed',
      text2: error.message,
    });
  }
};
export { handleExport, handleFilePicker, useHandleImport };
