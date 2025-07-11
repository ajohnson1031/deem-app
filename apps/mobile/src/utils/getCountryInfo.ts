import { CountryCode } from 'libphonenumber-js';
import { FlagType, getAllCountries } from 'react-native-country-picker-modal';

import { CountryInfo } from '~/types';

const countryCodeToEmoji = (code: string): string =>
  code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('');

export const getCountryInfo = async (code: CountryCode): Promise<CountryInfo | null> => {
  const countries = await getAllCountries(FlagType.EMOJI); // Still useful for name lookup
  const match = countries.find((c) => c.cca2 === code);

  if (!match) return null;

  return {
    name: match.name,
    flag: countryCodeToEmoji(code),
  };
};
