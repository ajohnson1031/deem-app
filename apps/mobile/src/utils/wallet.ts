import { RIPPLENET_URL } from '@env';
import { Client, Wallet, XrplError } from 'xrpl';

import { WalletBalanceResult } from '~/types';

const createNewWallet = (): Wallet => {
  const wallet = Wallet.generate(); // Generates random seed + keypair
  return wallet;
};

const getWalletBalance = async (address: string): Promise<WalletBalanceResult> => {
  if (!RIPPLENET_URL) {
    return {
      success: false,
      error: 'RIPPLENET_URL is not defined',
    };
  }

  const client = new Client(RIPPLENET_URL);

  try {
    await client.connect();
    const balance = await client.getXrpBalance(address);

    return {
      success: true,
      balance, // make sure it's returned as number
    };
  } catch (error) {
    if (error instanceof XrplError || error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred',
    };
  } finally {
    await client.disconnect();
  }
};

const getTransactionHistory = async (
  address: string,
  marker: any = null
): Promise<{ transactions: any[]; marker: any }> => {
  const client = new Client('wss://s.altnet.rippletest.net:51233'); // or your desired endpoint

  try {
    await client.connect();

    const response = await client.request({
      command: 'account_tx',
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 10,
      ...(marker ? { marker } : {}),
    });

    const transactions = (response.result.transactions || [])
      .filter((item: any) => item?.tx && item?.meta)
      .map((item: any) => ({
        hash: item.tx.hash,
        type: item.tx.TransactionType,
        amount: item.tx.Amount,
        date: item.tx.date,
        success: item.meta.TransactionResult === 'tesSUCCESS',
      }));

    return {
      transactions,
      marker: response.result.marker || null,
    };
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return { transactions: [], marker: null };
  } finally {
    await client.disconnect();
  }
};

export { createNewWallet, getTransactionHistory, getWalletBalance };
