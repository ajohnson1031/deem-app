import { API_BASE_URL } from '@env';
import axios from 'axios';
import { useSetAtom } from 'jotai';
import debounce from 'lodash.debounce';

import { usernameAvailabilityAtom } from '~/atoms';

export function useUsernameChecker() {
  const setAvailability = useSetAtom(usernameAvailabilityAtom);

  const checkUsername = debounce(async (username: string) => {
    if (username.length < 6) {
      setAvailability({ checking: false, available: null });
      return;
    }

    try {
      setAvailability({ checking: true, available: null });
      const res = await axios.get(`${API_BASE_URL}/auth/check-username?username=${username}`);
      setAvailability({ checking: false, available: res.data.available });
    } catch (err) {
      console.error('Username check failed:', err);
      setAvailability({ checking: false, available: null });
    }
  }, 500); // only fires if typing pauses for 500ms

  return checkUsername;
}
