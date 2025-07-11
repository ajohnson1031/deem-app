// ~/components/CountryPickerTrigger.tsx
import { Text, View } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

interface Props {
  country?: Country;
  countryCode: CountryCode;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

const CountryPickerTrigger = ({ country, countryCode, onSelect, disabled = false }: Props) => {
  const countryName = country?.name || countryCode;

  return (
    <View>
      {disabled ? (
        <Text className="mr-1 py-[6.125px] text-xl font-medium text-gray-500">
          {countryName as string}
        </Text>
      ) : (
        <CountryPicker
          countryCode={countryCode}
          withFilter
          withFlag
          withCallingCode
          withEmoji
          withCountryNameButton
          excludeCountries={[]}
          onSelect={onSelect}
          theme={{ fontSize: 18, fontFamily: 'Inter-Medium' }}
        />
      )}
    </View>
  );
};

export default CountryPickerTrigger;
