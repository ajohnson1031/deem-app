import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';

const deriveKeyFromPassword = async (password: string): Promise<string> => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
};

const encryptSeed = (seed: string, key: string): string => {
  return CryptoJS.AES.encrypt(seed, key).toString();
};

const decryptSeed = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export { decryptSeed, deriveKeyFromPassword, encryptSeed };
