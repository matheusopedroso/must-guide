import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { ADMIN_EMAIL } from '@/config/app';

export const isAllowed = (user) =>
  !!user && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL;

export const watchAuth = (cb) => onAuthStateChanged(auth, cb);
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
