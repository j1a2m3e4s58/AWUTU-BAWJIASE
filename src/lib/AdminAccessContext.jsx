import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_ADMIN_PASSWORD = 'T4N4AMEG8F5';
const ADMIN_RECOVERY_CODE = 'DTHC@T4N4AMEG8F5';
const PASSWORD_STORAGE_KEY = 'royal_admin_password';
const SESSION_STORAGE_KEY = 'royal_admin_session';

const AdminAccessContext = createContext(null);

const readStoredPassword = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_ADMIN_PASSWORD;
  }

  return localStorage.getItem(PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
};

const readSessionState = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'unlocked';
};

export function AdminAccessProvider({ children }) {
  const [password, setPassword] = useState(() => readStoredPassword());
  const [isUnlocked, setIsUnlocked] = useState(() => readSessionState());

  useEffect(() => {
    localStorage.setItem(PASSWORD_STORAGE_KEY, password);
  }, [password]);

  useEffect(() => {
    if (isUnlocked) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'unlocked');
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [isUnlocked]);

  const value = useMemo(() => ({
    isUnlocked,
    unlock(candidatePassword) {
      const nextPassword = readStoredPassword();
      const matches = candidatePassword === nextPassword;

      if (matches) {
        setPassword(nextPassword);
        setIsUnlocked(true);
      }

      return matches;
    },
    logout() {
      setIsUnlocked(false);
    },
    resetPassword(recoveryCode, newPassword) {
      if (recoveryCode !== ADMIN_RECOVERY_CODE) {
        return { ok: false, message: 'Recovery code is incorrect.' };
      }

      if (!newPassword || newPassword.length < 6) {
        return { ok: false, message: 'Use a password with at least 6 characters.' };
      }

      setPassword(newPassword);
      setIsUnlocked(false);
      return { ok: true };
    },
  }), [isUnlocked, password]);

  return (
    <AdminAccessContext.Provider value={value}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);

  if (!context) {
    throw new Error('useAdminAccess must be used within an AdminAccessProvider');
  }

  return context;
}
