import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDGItKXJeoAOOilQnAVqzZSKUblv5NYXbk",
    authDomain: "auth-wavestone.firebaseapp.com",
    projectId: "auth-wavestone",
    storageBucket: "auth-wavestone.firebasestorage.app",
    messagingSenderId: "164044271842",
    appId: "1:164044271842:web:ccb9f5be4eef74581c2ebb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken(); // ID token zum Senden an Backend
    return { user, token };
}

export async function logout() {
    await signOut(auth);
}
