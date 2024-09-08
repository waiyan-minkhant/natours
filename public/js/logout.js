import axios from 'axios';
import { showAlert } from './alerts';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${window.location.origin}/api/v1/users/logout`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
    console.log(err.message);
  }
};
