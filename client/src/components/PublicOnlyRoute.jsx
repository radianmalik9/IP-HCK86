import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
