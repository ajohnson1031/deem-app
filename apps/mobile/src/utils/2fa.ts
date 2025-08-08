import { API_BASE_URL } from '@env';

import { api } from '~/utils/api';

const checkTwoFactorStatus = async () => {
  try {
    const res = await api.get(`${API_BASE_URL}/auth/2fa-status`);
    return res.data.twoFactorEnabled;
  } catch (error: any) {
    console.error(error);
    return false;
  }
};

export { checkTwoFactorStatus };
