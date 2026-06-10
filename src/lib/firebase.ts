import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export async function signInWithEmail(email: string, pass: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, name: string, role: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, 'users', res.user.uid), {
      name: name || 'New User',
      email: email,
      role: role,
      profile_image: '',
      onboarded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return res.user;
  } catch (error) {
    console.error("Error registering user", error);
    throw error;
  }
}

async function handleOAuthResult(res: any, role: string) {
  const email = res.user.email || '';
  
  const userDoc = doc(db, 'users', res.user.uid);
  const snap = await getDoc(userDoc);
  
  if (!snap.exists()) {
    // If they are registering as a student, validate email domain
    if (role === 'student' && (!email.includes('.edu') && !email.includes('.ac.'))) {
      await signOut(auth); // Sign out since validation failed
      throw new Error("Student registration requires a valid college email address domain (.edu or .ac.).");
    }

    await setDoc(userDoc, {
      name: res.user.displayName || 'New User',
      email: email,
      role: role,
      profile_image: res.user.photoURL || '',
      onboarded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else {
    // If they are logging in as a student, we can either re-validate or just let them in.
    // The requirement says "maintain the required validation for college email domains".
    const userData = snap.data();
    if ((userData?.role === 'student' || role === 'student') && (!email.includes('.edu') && !email.includes('.ac.'))) {
      await signOut(auth);
      throw new Error("A valid college email address domain (.edu or .ac.) is required for student accounts.");
    }
  }
  return res.user;
}

export async function signInWithGoogle(role: string = 'student') {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return await handleOAuthResult(res, role);
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export async function signInWithGithub(role: string = 'student') {
  try {
    const res = await signInWithPopup(auth, githubProvider);
    return await handleOAuthResult(res, role);
  } catch (error) {
    console.error("Error signing in with GitHub", error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
