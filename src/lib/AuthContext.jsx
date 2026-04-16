import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseApi, firebaseServices } from '@/api/firebaseClient';
import { getMergedPublicSettings } from '@/lib/siteSettings';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const refreshPublicSettings = useCallback(async () => {
    if (!firebaseServices.db) {
      setAppPublicSettings(getMergedPublicSettings(null));
      setIsLoadingPublicSettings(false);
      return;
    }

    setIsLoadingPublicSettings(true);

    try {
      const settings = await firebaseApi.siteSettings.getPublic();
      setAppPublicSettings(getMergedPublicSettings(settings));
    } catch (error) {
      console.error('Failed to load public site settings:', error);
      setAppPublicSettings(getMergedPublicSettings(null));
    } finally {
      setIsLoadingPublicSettings(false);
    }
  }, []);

  useEffect(() => {
    refreshPublicSettings();
  }, [refreshPublicSettings]);

  useEffect(() => {
    if (!firebaseServices.auth) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      return undefined;
    }

    const unsubscribe = firebaseApi.auth.onAuthStateChanged(async (firebaseUser) => {
      setIsLoadingAuth(true);
      setAuthError(null);

      if (!firebaseUser) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }

      try {
        let profile = {};

        if (firebaseServices.db) {
          const profileSnapshot = await getDoc(doc(firebaseServices.db, 'users', firebaseUser.uid));
          if (profileSnapshot.exists()) {
            profile = profileSnapshot.data();
          }
        }

        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          claims: profile.claims || {},
          isAdmin: profile.isAdmin === true || profile.role === 'admin',
          ...profile,
        });
        setIsAuthenticated(true);
        setIsAdmin(profile.isAdmin === true || profile.role === 'admin');
      } catch (error) {
        console.error('Firebase auth profile load failed:', error);
        setAuthError({
          type: 'unknown',
          message: error.message || 'Failed to load user profile',
        });
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoadingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  const checkAppState = async () => {
    if (!firebaseServices.auth) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const currentUser = await firebaseApi.auth.getProfile();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      setIsAdmin(Boolean(currentUser?.isAdmin || currentUser?.role === 'admin'));
    } catch (error) {
      console.error('Firebase auth refresh failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Unable to refresh auth state',
      });
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    await firebaseApi.auth.logout(shouldRedirect ? '/' : '');
  };

  const navigateToLogin = () => {
    firebaseApi.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      refreshPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
