import { TxType } from '~/types';

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

const formatFloatClean = (num: number | string): string => {
  if (typeof num === 'string') num = parseFloat(num);
  if (isNaN(num)) return '0';

  return num.toString().replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
};

const capitalize = (str: string | TxType): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export { capitalize, formatFloatClean, formatWithCommas };
