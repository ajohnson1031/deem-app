import { Feather, FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useCopyToClipboard } from '~/hooks';
import { FieldVariant, LabelFieldWithCopyProps } from '~/types';
import { checkTwoFactorStatus } from '~/utils';

const LabelFieldWithCopy = ({
  label,
  value,
  valueKey,
  copiedMessage,
  requires2fa,
  className,
  variant = FieldVariant.STANDARD,
  onToggle = () => {},
}: LabelFieldWithCopyProps) => {
  const { copy, copiedKey } = useCopyToClipboard();
  const [readable, setReadable] = useState<boolean>(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);

  const handleMaskedToggle = async () => {
    if (requires2fa) {
      const twoFaEnabled = await checkTwoFactorStatus();
      if (twoFaEnabled) {
        setReadable(!readable);
        onToggle();
      } else {
        setTwoFaError(
          `Two-factor authentication is required to see the contents of this field. Please update your security settings.`
        );
      }
    } else {
      setReadable(!readable);
      onToggle();
    }
  };

  useEffect(() => {
    const errorTimeout = setTimeout(() => setTwoFaError(null), 3000);

    return () => clearTimeout(errorTimeout);
  }, [requires2fa, twoFaError]);

  return (
    <View>
      <View className={`flex-row gap-4 ${className}`}>
        <Text className="absolute -top-3 left-3 z-10 rounded-md bg-white px-2 pb-0.5 text-sm font-semibold text-slate-500">
          {label}
        </Text>
        <View className="w-full flex-row items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 py-4">
          <Text
            className="m-0 flex-1 px-4 py-1 text-lg"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontWeight: 500, color: copiedKey ? '#0284c7' : '#4B5563' }}>
            {copiedKey
              ? copiedMessage
              : variant === FieldVariant.STANDARD
                ? value
                : readable
                  ? value
                  : '•'.repeat(value.length)}
          </Text>

          {(variant === FieldVariant.STANDARD || (variant === FieldVariant.MASKED && readable)) && (
            <TouchableOpacity
              className={variant === FieldVariant.STANDARD ? 'pr-4' : 'pr-1.5'}
              disabled={!value}
              onPress={() => copy(value ?? '', valueKey)}>
              <Feather name="copy" size={20} color="#4B5563" />
            </TouchableOpacity>
          )}

          {variant === FieldVariant.MASKED && (
            <View className="flex gap-2">
              <TouchableOpacity className={`${'mr-3'}`} onPress={handleMaskedToggle}>
                <FontAwesome6
                  name={readable ? 'eye' : 'eye-slash'}
                  size={20}
                  color={readable ? '#374151' : '#9ca3af'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {twoFaError && <Text className="text-sm text-red-600">{twoFaError}</Text>}
    </View>
  );
};

export default LabelFieldWithCopy;
