import { Transaction } from '~/types';

const submitXrplTransaction = async (tx: any) => {
  console.log('XRPL Transaction', tx);
  return { success: 'Successful Transaction' };
};

const submitStandardTransaction = async (tx: Transaction) => {
  console.log('Standard Transaction', tx);
  return { success: 'Successful Transaction' };
};

export { submitStandardTransaction, submitXrplTransaction };
