// ~/components/CountryPickerTrigger.tsx
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

import { CountryInfo } from '~/types';
import { getCountryInfo } from '~/utils';

interface Props {
  countryCode: CountryCode;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

const CountryPickerTrigger = ({ countryCode, onSelect, disabled = false }: Props) => {
  const [info, setInfo] = useState<CountryInfo | null>(null);

  useEffect(() => {
    getCountryInfo(countryCode as any).then(setInfo);
  }, [countryCode]);

  return (
    <View>
      {disabled ? (
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[30px] opacity-60">{info?.flag || countryCode}</Text>
          <Text className="mr-1 py-[6.125px] text-[18.5px] font-medium text-gray-500">
            {info?.name as string}
          </Text>
        </View>
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
