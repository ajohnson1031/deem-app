// ~/components/CountryPickerTrigger.tsx
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

interface Props {
  countryCode: CountryCode;
  onSelect: (country: Country) => void;
}

const CountryPickerTrigger = ({ countryCode, onSelect }: Props) => {
  return (
    <CountryPicker
      countryCode={countryCode}
      withFilter
      withFlag
      withCallingCode
      withEmoji
      withCountryNameButton
      excludeCountries={[]}
      onSelect={onSelect}
    />
  );
};

export default CountryPickerTrigger;
