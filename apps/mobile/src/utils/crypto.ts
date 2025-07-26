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

interface EncryptedExport {
  salt: string;
  iv: string;
  ciphertext: string;
}

const encryptAndExport = (passphrase: string, dataToEncrypt: string): string => {
  // Generate random salt & IV
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);

  // Derive key using PBKDF2
  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 10_000,
  });

  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, key, { iv });

  // Prepare the exported object
  const exported: EncryptedExport = {
    salt: salt.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
  };

  // Return base64-encoded JSON string
  return btoa(JSON.stringify(exported));
};

const decryptAndImport = (passphrase: string, exportedBase64: string): string => {
  const exported: EncryptedExport = JSON.parse(atob(exportedBase64));
  const salt = CryptoJS.enc.Base64.parse(exported.salt);
  const iv = CryptoJS.enc.Base64.parse(exported.iv);
  const ciphertext = CryptoJS.enc.Base64.parse(exported.ciphertext);

  // Derive the key
  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 10_000,
  });

  // Correctly create a CipherParams object
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext,
  });

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv });

  // Return the decrypted string (or throw on error)
  const result = decrypted.toString(CryptoJS.enc.Utf8);
  if (!result) throw new Error('Incorrect passphrase or corrupted data.');
  return result;
};

export { decryptAndImport, decryptSeed, deriveKeyFromPassword, encryptAndExport, encryptSeed };
