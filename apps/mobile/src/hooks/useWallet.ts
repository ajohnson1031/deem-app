// hooks/useWallet.ts
import { API_BASE_URL, WALLET_STORAGE_KEY, WALLET_SYNCED_FLAG } from '@env';
import * as SecureStore from 'expo-secure-store';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { Wallet } from 'xrpl';

import { walletAtom, walletBalanceAtom } from '~/atoms';
import { api, decryptSeed, deriveKeyFromPassword, encryptSeed, getWalletBalance } from '~/utils';

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
    async (password: string) => {
      try {
        // Check for local seed first
        const seed = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
        if (seed) {
          setWallet(Wallet.fromSeed(seed));
          return;
        }

        // If seed is missing but we know we've already synced, don't fetch again
        const alreadySynced = await SecureStore.getItemAsync(WALLET_SYNCED_FLAG);
        if (alreadySynced) return;

        // Otherwise fetch from backend
        const res = await api.get(`${API_BASE_URL}/wallet`);
        const encryptedSeed = res.data?.encryptedSeed;

        if (encryptedSeed) {
          const key = await deriveKeyFromPassword(password);
          const decryptedSeed = decryptSeed(encryptedSeed, key);

          if (!decryptedSeed) throw new Error('Failed to decrypt wallet seed.');

          await SecureStore.setItemAsync(WALLET_STORAGE_KEY, decryptedSeed);
          await SecureStore.setItemAsync(WALLET_SYNCED_FLAG, 'true');

          setWallet(Wallet.fromSeed(decryptedSeed));
        }
      } catch (err) {
        console.warn('⚠️ Failed to load wallet:', err);
        await deleteWallet();
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
