import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      text1Style={{
        fontSize: 16, // 👈 Increase font size
        fontWeight: 'semibold',
      }}
      text2Style={{
        fontSize: 14, // 👈 Subtitle font size
      }}
    />
  ),
  error: (props: any) => (
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
  ),
};
