import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { PageData } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
import type { User } from 'firebase/auth';

const storage = getStorage(app);

export const ensureUserExists = async (user: User) => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      coupleId: null,
      createdAt: new Date()
    });
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error", error);
    throw error;
  }
};

export const savePagesToCloud = async (coupleId: string, pages: PageData[]) => {
  try {
    const docRef = doc(db, 'scrapbooks', coupleId);
    await setDoc(docRef, { pages });
  } catch (e) {
    console.error("Firebase save failed", e);
  }
};

export const loadPagesFromCloud = async (coupleId: string): Promise<PageData[] | null> => {
  try {
    const docRef = doc(db, 'scrapbooks', coupleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().pages as PageData[];
    }
    return null;
  } catch (e) {
    console.error("Failed to load data from Firebase", e);
    return null;
  }
};

export const subscribeToPages = (coupleId: string, callback: (pages: PageData[]) => void) => {
  const docRef = doc(db, 'scrapbooks', coupleId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().pages as PageData[]);
    }
  });
  return unsubscribe;
};

export async function uploadImage(file: File, coupleId: string): Promise<string> {
  try {
    const fileRef = ref(storage, `scrapbooks/${coupleId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (e) {
    console.error("Image upload failed", e);
    // Fallback if uploading to storage fails (e.g., missing storage rules)
    return URL.createObjectURL(file);
  }
}
