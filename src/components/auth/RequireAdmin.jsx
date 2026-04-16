import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAccess } from '@/lib/AdminAccessContext';

export default function RequireAdmin({ authPending = false, settingsPending = false }) {
  const { isUnlocked } = useAdminAccess();
  const location = useLocation();

  if (authPending || settingsPending) {
    return null;
  }

  if (!isUnlocked) {
    return <Navigate to={`/?admin_required=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
