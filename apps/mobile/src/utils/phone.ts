import { AsYouType, CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';

// Format input as user types
export const formatInternationalPhone = (input: string, defaultCountry: CountryCode = 'US') => {
  return new AsYouType(defaultCountry).input(input);
};

// Validate a number
export const isValidPhoneNumber = (input: string): boolean => {
  const phone = parsePhoneNumberFromString(input);
  return phone?.isValid() || false;
};
