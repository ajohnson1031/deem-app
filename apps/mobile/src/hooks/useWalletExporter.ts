import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback } from 'react';

export const useWalletExporter = () => {
  // 🔐 Encrypt the wallet object using a passphrase
  const encryptWalletData = useCallback((wallet: object, passphrase: string): string => {
    const json = JSON.stringify(wallet);
    return CryptoJS.AES.encrypt(json, passphrase).toString();
  }, []);

  // 💾 Save encrypted data to a file
  const saveEncryptedFile = useCallback(async (encryptedData: string): Promise<string> => {
    const fileName = `wallet-backup-${Date.now()}.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, encryptedData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  }, []);

  // 📤 Share the file (iCloud, Drive, Files, AirDrop, etc.)
  const shareFile = useCallback(async (fileUri: string) => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      throw new Error('Sharing is not supported on this device.');
    }

    await Sharing.shareAsync(fileUri);
  }, []);

  // 🧠 Main handler
  const exportWallet = useCallback(
    async (wallet: object, passphrase: string) => {
      const encrypted = encryptWalletData(wallet, passphrase);
      const fileUri = await saveEncryptedFile(encrypted);
      await shareFile(fileUri);
    },
    [encryptWalletData, saveEncryptedFile, shareFile]
  );

  return { exportWallet };
};
