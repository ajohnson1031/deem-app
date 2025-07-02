import CryptoJS from "crypto-js";

export const deriveKey = async (password: string): Promise<string> => {
  const hash = CryptoJS.SHA256(password);
  return hash.toString(CryptoJS.enc.Hex);
};

export const encryptSeed = (seed: string, key: string): string => {
  return CryptoJS.AES.encrypt(seed, key).toString();
};

export const decryptSeed = (encrypted: string, key: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
};
