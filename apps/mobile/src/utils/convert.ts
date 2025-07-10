const convertCurrencyAmount = ({
  amount,
  fromCurrency,
  xrpPriceUSD,
}: {
  amount: number;
  fromCurrency: 'XRP' | 'USD';
  xrpPriceUSD: number;
}) => {
  if (!xrpPriceUSD || amount <= 0) return { usdAmount: 0, xrpAmount: 0 };

  if (fromCurrency === 'USD') {
    return {
      usdAmount: amount,
      xrpAmount: parseFloat((amount / xrpPriceUSD).toFixed(6)),
    };
  } else {
    return {
      usdAmount: parseFloat((amount * xrpPriceUSD).toFixed(2)),
      xrpAmount: amount,
    };
  }
};

export { convertCurrencyAmount };
