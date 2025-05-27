// hooks/useWallet.ts
import { RIPPLENET_URL, WALLET_STORAGE_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Client, Wallet } from 'xrpl';

type WalletBalance = { success: boolean; balance?: string; error?: string };

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    const stored = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
    if (stored) {
      const { privateKey } = JSON.parse(stored);
      setWallet(Wallet.fromSeed(privateKey));
    }
  }, []);

  const saveWallet = async (wallet: Wallet) => {
    await AsyncStorage.setItem(
      WALLET_STORAGE_KEY,
      JSON.stringify({
        classicAddress: wallet.classicAddress,
        publicKey: wallet.publicKey,
        privateKey: wallet.seed,
      })
    );
  };

  const createWallet = useCallback(async () => {
    const newWallet = Wallet.generate();
    await saveWallet(newWallet);
    setWallet(newWallet);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!wallet || !RIPPLENET_URL) return;
    const client = new Client(RIPPLENET_URL);

    try {
      await client.connect();
      const balance = await client.getXrpBalance(wallet.classicAddress);
      setWalletBalance({ success: true, balance: balance.toString() });
    } catch (e: any) {
      setWalletBalance({ success: false, error: e.message });
    } finally {
      await client.disconnect();
    }
  }, [wallet]);

  useEffect(() => {
    (async () => {
      await loadWallet();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (wallet) refreshBalance();
  }, [wallet]);

  return {
    wallet,
    walletAddress: wallet?.classicAddress ?? null,
    walletBalance,
    loading,
    createWallet,
    refreshBalance,
  };
}
