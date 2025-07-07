import { View } from 'react-native';
import { ErrorToast, InfoToast, SuccessToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <View className="mt-8">
      <SuccessToast
        {...props}
        text1Style={{
          fontSize: 16, // 👈 Increase font size
          fontWeight: 'semibold',
        }}
        text2Style={{
          fontSize: 14, // 👈 Subtitle font size
        }}
      />
    </View>
  ),
  error: (props: any) => (
    <View className="mt-8">
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 16,
          fontWeight: 'semibold',
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    </View>
  ),
  info: (props: any) => (
    <View className="mt-8">
      <InfoToast
        {...props}
        text1Style={{
          fontSize: 16,
          fontWeight: 'semibold',
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    </View>
  ),
};
