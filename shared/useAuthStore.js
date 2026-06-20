import { create } from 'zustand';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

function friendlyError(error) {
  const code = error?.code || '';
  const map = {
    'auth/network-request-failed': 'Network error — ensure Email/Password sign‑in is enabled and localhost is authorized.',
    'auth/invalid-api-key': 'Invalid Firebase API key. Check your .env.',
    'auth/email-already-in-use': 'Email already registered.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/user-not-found': 'No account found.',
    'auth/invalid-credential': 'Invalid credentials.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign‑in closed.',
    'auth/popup-blocked': 'Popup blocked; enable popups.',
    'auth/too-many-requests': 'Too many attempts, try later.',
    'auth/operation-not-allowed': 'Enable this sign‑in method in Firebase console.',
  };
  return map[code] || error?.message || 'Unexpected error.';
}

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initAuthListener: () => {
    set({ loading: true });
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        try {
          await get().fetchProfile(user.uid);
        } catch (err) {
          console.error('Error fetching profile in auth listener:', err);
        }
      } else {
        set({ user: null, profile: null });
      }
      set({ loading: false });
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, loading: false });
      return userCredential.user;
    } catch (error) {
      const msg = friendlyError(error);
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user profile already exists in Firestore, if not create it
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      let profileData;
      if (!docSnap.exists()) {
        profileData = {
          name: user.displayName || 'Google User',
          email: user.email,
          isAdmin: false,
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, profileData);
      } else {
        profileData = docSnap.data();
      }
      
      set({ user, profile: profileData, loading: false });
      return user;
    } catch (error) {
      const msg = friendlyError(error);
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const profileData = {
        name,
        email,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', user.uid), profileData);
      set({ user, profile: profileData, loading: false });
      return user;
    } catch (error) {
      const msg = friendlyError(error);
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      const msg = friendlyError(error);
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  fetchProfile: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ profile: docSnap.data() });
      } else {
        console.warn(`Profile for user ${uid} does not exist in Firestore.`);
        const user = get().user;
        set({ profile: { email: user?.email, name: user?.displayName || '' } });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const user = get().user;
      set({ profile: { email: user?.email, name: user?.displayName || '' } });
    }
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) throw new Error('No authenticated user');
    set({ loading: true });
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      const docSnap = await getDoc(docRef);
      set({ profile: docSnap.data(), loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));

export default useAuthStore;
