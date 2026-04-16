import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const firebaseServices = {
  app,
  auth: app ? getAuth(app) : null,
  db: app
    ? initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        useFetchStreams: false,
      })
    : null,
  storage: app ? getStorage(app) : null,
  hasFirebaseConfig,
};

const entityCollections = {
  Announcement: 'announcements',
  ArchiveDocument: 'archiveDocuments',
  AuditLog: 'auditLogs',
  Comment: 'comments',
  CommunityEvent: 'communityEvents',
  ContactMessage: 'contactMessages',
  GalleryItem: 'galleryItems',
  HistoryContent: 'historyContents',
  King: 'kings',
  TrainingVideo: 'trainingVideos',
  TributeMessage: 'tributeMessages',
};

const ensureFirestore = () => {
  if (!firebaseServices.db) {
    throw new Error('Firebase Firestore is not configured. Add your VITE_FIREBASE_* values first.');
  }
  return firebaseServices.db;
};

const ensureStorage = () => {
  if (!firebaseServices.storage) {
    throw new Error('Firebase Storage is not configured. Add your VITE_FIREBASE_* values first.');
  }
  return firebaseServices.storage;
};

const withTimeout = (promise, label = 'Firebase request', timeoutMs = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} took too long. Please check your connection and Firebase permissions.`));
      }, timeoutMs);
    }),
  ]);

const toIsoString = (value) => {
  if (!value) return value;
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

const normalizeData = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeData);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const normalized = {};

  Object.entries(value).forEach(([key, itemValue]) => {
    normalized[key] = normalizeData(toIsoString(itemValue));
  });

  return normalized;
};

const normalizeDoc = (snapshot) => ({
  id: snapshot.id,
  ...normalizeData(snapshot.data()),
});

const prepareForWrite = (data, isCreate = false) => {
  const now = serverTimestamp();
  return {
    ...data,
    updated_date: now,
    ...(isCreate ? { created_date: now } : {}),
  };
};

const getCollectionName = (entityName) => {
  const collectionName = entityCollections[entityName];
  if (!collectionName) {
    throw new Error(`No Firebase collection mapping found for entity "${entityName}".`);
  }
  return collectionName;
};

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;

  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);

  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right));
};

const applySortAndLimit = (items, sortBy, limitCount) => {
  let sortedItems = [...items];

  if (sortBy) {
    const descending = sortBy.startsWith('-');
    const fieldName = descending ? sortBy.slice(1) : sortBy;
    sortedItems.sort((left, right) => {
      const comparison = compareValues(left[fieldName], right[fieldName]);
      return descending ? -comparison : comparison;
    });
  }

  if (typeof limitCount === 'number') {
    sortedItems = sortedItems.slice(0, limitCount);
  }

  return sortedItems;
};

const matchesFilters = (item, filters = {}) =>
  Object.entries(filters).every(([key, expected]) => {
    if (expected === undefined) {
      return true;
    }
    return item[key] === expected;
  });

const createEntityApi = (entityName) => {
  const getCollectionRef = () => collection(ensureFirestore(), getCollectionName(entityName));

  return {
    async list(sortBy, limitCount) {
      if (!firebaseServices.db) {
        return [];
      }

      const snapshot = await getDocs(getCollectionRef());
      const items = snapshot.docs.map(normalizeDoc);
      return applySortAndLimit(items, sortBy, limitCount);
    },

    async filter(filters = {}, sortBy, limitCount) {
      const items = await this.list(sortBy, undefined);
      return applySortAndLimit(items.filter((item) => matchesFilters(item, filters)), sortBy, limitCount);
    },

    async get(id) {
      if (!firebaseServices.db) {
        return null;
      }

      const snapshot = await getDoc(doc(ensureFirestore(), getCollectionName(entityName), id));
      return snapshot.exists() ? normalizeDoc(snapshot) : null;
    },

    async create(data) {
      const payload = prepareForWrite(data, true);
      const reference = await withTimeout(addDoc(getCollectionRef(), payload), `${entityName} save`);
      return {
        id: reference.id,
        ...normalizeData(data),
      };
    },

    async update(id, data) {
      const reference = doc(ensureFirestore(), getCollectionName(entityName), id);
      await withTimeout(updateDoc(reference, prepareForWrite(data)), `${entityName} update`);
      return {
        id,
        ...normalizeData(data),
      };
    },

    async delete(id) {
      await withTimeout(deleteDoc(doc(ensureFirestore(), getCollectionName(entityName), id)), `${entityName} delete`);
      return { success: true };
    },
  };
};

const loadCurrentUserProfile = async () => {
  if (!firebaseServices.auth) {
    return null;
  }

  const currentUser = firebaseServices.auth.currentUser;

  if (!currentUser) {
    return null;
  }

  let profile = {};
  let claims = {};

  if (firebaseServices.db) {
    const profileSnapshot = await getDoc(doc(firebaseServices.db, 'users', currentUser.uid));
    if (profileSnapshot.exists()) {
      profile = normalizeData(profileSnapshot.data());
    }
  }

  const tokenResult = await currentUser.getIdTokenResult();
  claims = tokenResult?.claims ?? {};

  return {
    id: currentUser.uid,
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    claims,
    isAdmin: claims.admin === true || profile.role === 'admin',
    ...profile,
  };
};

const uploadFile = async ({ file, folder = 'public/uploads' }) => {
      const storage = ensureStorage();
      const safeName = `${Date.now()}-${file.name}`.replace(/\s+/g, '-');
      const storageRef = ref(storage, `${folder}/${safeName}`);
  await withTimeout(uploadBytes(storageRef, file), 'File upload', 30000);
  const fileUrl = await withTimeout(getDownloadURL(storageRef), 'File URL lookup', 15000);
  return { file_url: fileUrl };
};

export const firebaseApi = {
  entities: Object.fromEntries(
    Object.keys(entityCollections).map((entityName) => [entityName, createEntityApi(entityName)])
  ),
  auth: {
    async signIn(email, password) {
      if (!firebaseServices.auth) {
        throw new Error('Firebase Auth is not configured.');
      }
      const credential = await signInWithEmailAndPassword(firebaseServices.auth, email, password);
      return credential.user;
    },
    async me() {
      const user = await loadCurrentUserProfile();
      if (!user) {
        throw new Error('No authenticated Firebase user.');
      }
      return user;
    },
    async logout(redirectTo = '/') {
      if (firebaseServices.auth) {
        await signOut(firebaseServices.auth);
      }
      if (redirectTo) {
        window.location.assign(redirectTo);
      }
    },
    redirectToLogin(fromUrl = window.location.href) {
      const target = `/admin?from=${encodeURIComponent(fromUrl)}`;
      window.location.assign(target);
    },
    onAuthStateChanged(callback) {
      if (!firebaseServices.auth) {
        callback(null);
        return () => {};
      }
      return onAuthStateChanged(firebaseServices.auth, callback);
    },
    async getProfile() {
      return loadCurrentUserProfile();
    },
  },
  integrations: {
    Core: {
      UploadFile: uploadFile,
    },
  },
  siteSettings: {
    async getPublic() {
      if (!firebaseServices.db) {
        return null;
      }

      const snapshot = await getDoc(doc(ensureFirestore(), 'siteSettings', 'public-site'));
      return snapshot.exists() ? normalizeDoc(snapshot) : null;
    },
    async upsertPublic(data) {
      const reference = doc(ensureFirestore(), 'siteSettings', 'public-site');
      await withTimeout(
        setDoc(
          reference,
          {
            ...data,
            updated_date: serverTimestamp(),
          },
          { merge: true }
        ),
        'Site settings save'
      );
      const snapshot = await withTimeout(getDoc(reference), 'Site settings verification', 10000);
      if (!snapshot.exists()) {
        throw new Error('Site settings did not save. Please try again.');
      }
      return normalizeDoc(snapshot);
    },
    async getHeroBanners() {
      if (!firebaseServices.db) {
        return null;
      }

      const snapshot = await getDoc(doc(ensureFirestore(), 'siteSettings', 'hero-banners'));
      return snapshot.exists() ? normalizeDoc(snapshot) : null;
    },
    async upsertHeroBanners(data) {
      const reference = doc(ensureFirestore(), 'siteSettings', 'hero-banners');
      await withTimeout(
        setDoc(
          reference,
          {
            ...data,
            updated_date: serverTimestamp(),
          },
          { merge: true }
        ),
        'Hero banners save'
      );
      const snapshot = await withTimeout(getDoc(reference), 'Hero banners verification', 10000);
      if (!snapshot.exists()) {
        throw new Error('Hero banners did not save. Please try again.');
      }
      return normalizeDoc(snapshot);
    },
  },
};
