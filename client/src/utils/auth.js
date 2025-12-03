// client/src/utils/auth.js
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  return {
    id: localStorage.getItem('userId'),
    role: localStorage.getItem('userRole')
  };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  window.location.href = '/';
};