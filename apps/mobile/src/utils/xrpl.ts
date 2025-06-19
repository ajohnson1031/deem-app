import { Transaction } from '~/types';

const submitXrplTransaction = async (tx: any) => {
  return { success: 'Successful Transaction' };
};

const submitStandardTransaction = async (tx: Transaction) => {
  return { success: 'Successful Transaction' };
};

const getCurrentXrpPrice = async (): Promise<number> => {
  // For now, return a static price (mocked)
  return 2.15; // USD per XRP
};

export { getCurrentXrpPrice, submitStandardTransaction, submitXrplTransaction };
