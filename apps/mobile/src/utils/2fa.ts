import { API_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';

import { api } from '~/utils/api';

const checkTwoFactorStatus = async () => {
  try {
    const res = await api.get(`${API_BASE_URL}/me/2fa-status`);
    return res.data.twoFactorEnabled;
  } catch (error: any) {
    Toast.show({ type: 'error', text1: 'System Error', text2: error?.message ?? error });
    console.error(error);
    return false;
  }
};

export { checkTwoFactorStatus };
