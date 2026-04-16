import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAccess } from '@/lib/AdminAccessContext';

export default function RequireAdmin() {
  const { isUnlocked } = useAdminAccess();
  const location = useLocation();

  if (!isUnlocked) {
    return <Navigate to={`/?admin_required=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
