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
  withFeesIncluded: number; // in USD
  totalInXrp: number; // total including fee, in XRP
  breakdown: string;
}

const calculateFee = ({
  type,
  amount,
  currency,
  xrpPriceUSD,
}: FeeCalculationInput): FeeCalculationResult => {
  if (amount <= 0 || xrpPriceUSD <= 0) {
    return {
      fee: 0,
      withFeesIncluded: 0,
      totalInXrp: 0,
      breakdown: 'Invalid input',
    };
  }

  const amountInUSD = currency === 'XRP' ? amount * xrpPriceUSD : amount;
  let fee = 0;

  if (type === 'BANK') {
    fee = 1.49; // flat fee
  }

  if (type === 'GIFT_CARD') {
    const rawFee = amountInUSD * 0.15;
    fee = Math.max(rawFee, 0.25); // min $0.25
  }

  const withFeesIncluded = amountInUSD + fee;
  const totalInXrp = withFeesIncluded / xrpPriceUSD;

  return {
    fee: parseFloat(fee.toFixed(2)),
    withFeesIncluded: parseFloat(withFeesIncluded.toFixed(2)),
    totalInXrp: parseFloat(totalInXrp.toFixed(4)),
    breakdown:
      type === 'BANK'
        ? `Flat fee of $${fee.toFixed(2)} applied for bank transfer`
        : `15% fee ($${(amountInUSD * 0.15).toFixed(2)}) applied${fee === 0.25 ? ' (minimum $0.25)' : ''}`,
  };
};

export { calculateFee };
