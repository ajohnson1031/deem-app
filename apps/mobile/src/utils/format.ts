import { TxType } from '~/atoms/transaction';

const formatWithCommas = (value: string) => {
  if (value.endsWith('.')) {
    const [whole] = value.split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedWhole}.`;
  }

  const [whole, decimal] = value.split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
};

const capitalize = (str: string | TxType): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export { capitalize, formatWithCommas };
