export type FeeTransactionType = 'BANK' | 'GIFT_CARD';
export type Currency = 'USD' | 'XRP';

interface FeeCalculationInput {
  type: FeeTransactionType;
  amount: number; // This is the amount the user wants to receive (in USD or XRP)
  currency: Currency;
  xrpPriceUSD: number;
}

interface FeeCalculationResult {
  fee: number; // in USD
  totalUsdWithFees: number; // USD amount + fee
  totalInXrp: number; // total including fee (in XRP)
  feeInXrp?: number; // optional, only when input is in XRP
  breakdown: string;
}

const calculateFees = ({
  type,
  amount,
  currency,
  xrpPriceUSD,
}: FeeCalculationInput): FeeCalculationResult => {
  if (amount <= 0 || xrpPriceUSD <= 0) {
    return {
      fee: 0,
      totalUsdWithFees: 0,
      totalInXrp: 0,
      breakdown: 'Invalid input',
    };
  }

  const isXrpInput = currency === 'XRP';
  const amountInUSD = isXrpInput ? amount * xrpPriceUSD : amount;

  let fee = 0;

  if (type === 'BANK') {
    fee = amountInUSD < 100 ? 0.99 : 1.49;
  }

  if (type === 'GIFT_CARD') {
    const rawFee = amountInUSD * 0.15;
    fee = Math.max(rawFee, 0.25);
  }

  const totalUsdWithFees = amountInUSD + fee;
  const totalInXrp = totalUsdWithFees / xrpPriceUSD;

  const result: FeeCalculationResult = {
    fee: parseFloat(fee.toFixed(2)),
    totalUsdWithFees: parseFloat(totalUsdWithFees.toFixed(2)),
    totalInXrp: parseFloat(totalInXrp.toFixed(4)),
    breakdown:
      type === 'BANK'
        ? `Flat fee of $${fee.toFixed(2)} for bank transfer`
        : `15% fee ($${(amountInUSD * 0.15).toFixed(2)}) ${
            fee === 0.25 ? '(minimum applied)' : ''
          }`,
  };

  if (isXrpInput) {
    result.feeInXrp = parseFloat((fee / xrpPriceUSD).toFixed(4));
  }

  return result;
};

export { calculateFees };
