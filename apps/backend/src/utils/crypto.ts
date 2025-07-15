import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

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

export const checkPassword = async (inputPassword: string, hashedPassword: string) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

const JWT_SECRET = process.env.JWT_SECRET!; // Ensure this exists in your .env file

export const generateJWT = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "7d", // or whatever duration you prefer
  });
};
