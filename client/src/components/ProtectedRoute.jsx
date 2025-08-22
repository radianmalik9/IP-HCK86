import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { showConfirm } from '../utils/notifications';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      (async () => {
        const res = await showConfirm(
          'Butuh Login',
          'Silakan login untuk mengakses fitur ini.',
          'Login',
          'Batal'
        );
        if (res.isConfirmed) {
          navigate('/login', { replace: true, state: { from: location } });
        } else {
          navigate('/', { replace: true });
        }
      })();
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated) return null;
  return children;
}
