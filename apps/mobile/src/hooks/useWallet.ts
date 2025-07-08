// hooks/useWallet.ts
import { API_BASE_URL, WALLET_STORAGE_KEY, WALLET_SYNCED_FLAG } from '@env';
import * as SecureStore from 'expo-secure-store';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { Wallet } from 'xrpl';

import { walletAtom, walletBalanceAtom } from '~/atoms';
import { decryptSeed, deriveKeyFromPassword, encryptSeed, getWalletBalance } from '~/utils';
import { api } from '~/utils/api';

export function useWallet() {
  const [wallet, setWallet] = useAtom(walletAtom);
  const [walletBalance, setWalletBalance] = useAtom(walletBalanceAtom);

  const setLoading = (loading: boolean) => {
    setWalletBalance((prev) => ({ ...prev, loading }));
  };

  const saveWallet = async (wallet: Wallet) => {
    await SecureStore.setItemAsync(WALLET_STORAGE_KEY, wallet.seed!);
  };

  const loadWallet = useCallback(
    async (password?: string) => {
      try {
        const seed = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
        if (seed) {
          setWallet(Wallet.fromSeed(seed));
          return;
        }

        const alreadySynced = await SecureStore.getItemAsync(WALLET_SYNCED_FLAG);

        if (alreadySynced) return;

        const res = await api.get('/wallet');
        const encryptedSeed = res.data?.encryptedSeed;

        if (encryptedSeed) {
          if (!password) throw new Error('Password is required for decryption');

          const key = await deriveKeyFromPassword(password);
          const decryptedSeed = decryptSeed(encryptedSeed, key);

          if (!decryptedSeed) throw new Error('Decryption failed');

          await SecureStore.setItemAsync(WALLET_STORAGE_KEY, decryptedSeed);
          await SecureStore.setItemAsync(WALLET_SYNCED_FLAG, 'true');

          setWallet(Wallet.fromSeed(decryptedSeed));
        }
      } catch (err) {
        console.warn('❌ Wallet load error:', err);
        await deleteWallet(); // This resets to null
      }
    },
    [setWallet]
  );

  const createWallet = useCallback(async (password: string) => {
    const newWallet = Wallet.generate();
    await saveWallet(newWallet);

    const alreadySynced = await SecureStore.getItemAsync(WALLET_SYNCED_FLAG);
    if (!alreadySynced) {
      const key = await deriveKeyFromPassword(password);
      const encryptedSeed = encryptSeed(newWallet.seed!, key);

      try {
        await api.post(`${API_BASE_URL}/wallet`, { encryptedSeed });
        await SecureStore.setItemAsync(WALLET_SYNCED_FLAG, 'true');
      } catch (err) {
        console.error('Failed to save wallet remotely:', err);
      }
    }

    setWallet(newWallet);
  }, []);

  const deleteWallet = async () => {
    await SecureStore.deleteItemAsync(WALLET_STORAGE_KEY);
    await SecureStore.deleteItemAsync(WALLET_SYNCED_FLAG);
    setWallet(null);
    setWalletBalance({ success: false, balance: 0 });
  };

  const regenerateWallet = useCallback(async (password: string) => {
    const newWallet = Wallet.generate();

    // Local
    await saveWallet(newWallet);

    // Remote
    const key = await deriveKeyFromPassword(password);
    const encryptedSeed = encryptSeed(newWallet.seed!, key);

    await api.post(`${API_BASE_URL}/wallet`, {
      encryptedSeed,
      walletAddress: newWallet.classicAddress,
    });
    await SecureStore.setItemAsync(WALLET_SYNCED_FLAG, 'true');

    setWallet(newWallet);
    await refreshBalance();
  }, []);

  const reEncryptSeed = useCallback(
    async (oldPassword: string, newPassword: string) => {
      if (!wallet?.seed) {
        console.warn('No wallet loaded.');
        return;
      }

      try {
        const seed = wallet.seed;

        const newKey = await deriveKeyFromPassword(newPassword);
        const newEncryptedSeed = encryptSeed(seed, newKey);

        await api.patch(`${API_BASE_URL}/wallet`, { encryptedSeed: newEncryptedSeed });
        await SecureStore.setItemAsync(WALLET_STORAGE_KEY, seed);
      } catch (err) {
        console.error('Failed to re-encrypt wallet:', err);
      }
    },
    [wallet]
  );

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;

    try {
      setLoading(true);
      const result = await getWalletBalance(wallet.classicAddress);
      setWalletBalance(result);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) refreshBalance();
  }, [wallet, refreshBalance]);

  return {
    wallet,
    walletAddress: wallet?.classicAddress ?? null,
    walletBalance,
    loading: walletBalance.loading ?? false,
    loadWallet,
    createWallet,
    saveWallet,
    regenerateWallet,
    reEncryptSeed,
    deleteWallet,
    refreshBalance,
  };
}
