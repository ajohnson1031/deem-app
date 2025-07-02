import { RIPPLENET_URL } from '@env';
import { Client } from 'xrpl';

import { Transaction, WalletBalanceResult } from '~/types';

const getWalletBalance = async (address: string): Promise<WalletBalanceResult> => {
  if (!RIPPLENET_URL) {
    return {
      balance: 0,
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
      balance, // ensure number type
    };
  } catch (error) {
    return {
      balance: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    await client.disconnect();
  }
};

const getTransactionHistory = async (
  address: string,
  marker: any = null
): Promise<{ transactions: any[]; marker: any }> => {
  const client = new Client(RIPPLENET_URL);

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

const submitXrplTransaction = async (tx: any) => {
  return { success: 'Successful Transaction' };
};

const submitStandardTransaction = async (tx: Transaction) => {
  return { success: 'Successful Transaction' };
};

export {
  getTransactionHistory,
  getWalletBalance,
  submitStandardTransaction,
  submitXrplTransaction,
};
