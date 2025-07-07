import { AsYouType, CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js/max';

// Format input as user types
export const sanitizePhone = (input: string) =>
  input.replace(/[^\d ]/g, '').replace(/\s{2,}/g, ' ');
// strips everything except numbers and intervening spaces

export const formatPhoneOnBlur = (input: string, countryCode: CountryCode) => {
  const formatter = new AsYouType(countryCode);
  formatter.input(input);
  return formatter.getNumber()?.formatInternational() || input;
};

// Validate a number
export const isValidPhoneNumber = (input: string, defaultCountry: CountryCode) => {
  const phone = parsePhoneNumberFromString(input, defaultCountry);
  return phone?.isValid() || false;
};
