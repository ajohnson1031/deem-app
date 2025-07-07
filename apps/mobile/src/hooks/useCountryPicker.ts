// ~/hooks/useCountryPicker.ts
import {
  getCountries as getPhoneCountries,
  CountryCode as PhoneCountryCode,
} from 'libphonenumber-js';
import { useEffect, useState } from 'react';
import {
  Country,
  FlagType,
  getAllCountries,
  CountryCode as PickerCountryCode,
} from 'react-native-country-picker-modal';

// Define the type intersection of both libraries
type ValidCountryCode = PickerCountryCode & PhoneCountryCode;

const flagType: FlagType = FlagType.FLAT;

export const useCountryPicker = (defaultCode: ValidCountryCode = 'US') => {
  const [countryCode, setCountryCode] = useState<ValidCountryCode>(defaultCode);
  const [country, setCountry] = useState<Country | undefined>();
  const [callingCode, setCallingCode] = useState<string>('1'); // US default
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      try {
        const supportedPhoneCountries = getPhoneCountries(); // from libphonenumber-js
        const all = await getAllCountries(flagType); // from react-native-country-picker-modal

        const defaultCountry = all.find(
          (c) =>
            c.cca2 === defaultCode && supportedPhoneCountries.includes(c.cca2 as PhoneCountryCode)
        );

        if (defaultCountry) {
          setCountry(defaultCountry);
          setCallingCode(defaultCountry.callingCode[0] || '');
          setCountryCode(defaultCountry.cca2 as ValidCountryCode);
        }
      } catch (err) {
        console.error('Failed to initialize country picker:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [defaultCode]);

  const onSelect = (selected: Country) => {
    const phoneCountries = getPhoneCountries();

    if (phoneCountries.includes(selected.cca2 as PhoneCountryCode)) {
      setCountry(selected);
      setCountryCode(selected.cca2 as ValidCountryCode);
      setCallingCode(selected.callingCode[0] || '');
    } else {
      console.warn(`Unsupported phone country: ${selected.cca2}`);
    }
  };

  return {
    country,
    countryCode,
    callingCode,
    isLoading,
    onSelect,
    setCountry,
    setCountryCode,
  };
};
