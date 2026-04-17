import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseApi, firebaseServices } from '@/api/firebaseClient';
import {
  applyHeroBannersToSettings,
  getMergedHeroBanners,
  getMergedPublicSettings,
} from '@/lib/siteSettings';

const AuthContext = createContext();
const PUBLIC_SETTINGS_CACHE_KEY = 'awutu-public-settings-cache-v1';
const PUBLIC_SETTINGS_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

const loadCachedPublicSettings = () => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = JSON.parse(localStorage.getItem(PUBLIC_SETTINGS_CACHE_KEY) || 'null');
    if (!cached?.settings || !cached.cachedAt) return null;
    if (Date.now() - cached.cachedAt > PUBLIC_SETTINGS_CACHE_MAX_AGE) return null;
    return cached.settings;
  } catch {
    localStorage.removeItem(PUBLIC_SETTINGS_CACHE_KEY);
    return null;
  }
};

const saveCachedPublicSettings = (settings) => {
  if (typeof window === 'undefined' || !settings) return;

  try {
    localStorage.setItem(
      PUBLIC_SETTINGS_CACHE_KEY,
      JSON.stringify({ settings, cachedAt: Date.now() })
    );
  } catch {
    // Storage is only a speed helper; Firebase remains the source of truth.
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(() => loadCachedPublicSettings());

  const refreshPublicSettings = useCallback(async () => {
    if (!firebaseServices.db) {
      setAppPublicSettings(getMergedPublicSettings(null));
      setIsLoadingPublicSettings(false);
      return;
    }

    setIsLoadingPublicSettings(true);

    try {
      const [settingsResult, heroBannersResult] = await Promise.allSettled([
        firebaseApi.siteSettings.getPublic(),
        firebaseApi.siteSettings.getHeroBanners(),
      ]);

      const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
      const heroBanners = heroBannersResult.status === 'fulfilled' ? heroBannersResult.value : null;

      if (settingsResult.status === 'rejected') {
        console.error('Failed to load main public settings:', settingsResult.reason);
      }

      if (heroBannersResult.status === 'rejected') {
        console.error('Failed to load hero banners:', heroBannersResult.reason);
      }

      const mergedPublicSettings = applyHeroBannersToSettings(settings, heroBanners);
      setAppPublicSettings(mergedPublicSettings);
      saveCachedPublicSettings(mergedPublicSettings);
    } catch (error) {
      console.error('Failed to load public site settings:', error);
      setAppPublicSettings(getMergedPublicSettings(null));
    } finally {
      setIsLoadingPublicSettings(false);
    }
  }, []);

  const updatePublicSettingsCache = useCallback((settings, heroBanners) => {
    setAppPublicSettings((currentSettings) => {
      const baseSettings = getMergedPublicSettings(settings);
      let mergedSettings;

      if (heroBanners) {
        mergedSettings = applyHeroBannersToSettings(baseSettings, getMergedHeroBanners(heroBanners));
      } else {
        mergedSettings = applyHeroBannersToSettings(baseSettings, currentSettings);
      }

      saveCachedPublicSettings(mergedSettings);
      return mergedSettings;
    });
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
      updatePublicSettingsCache,
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
