import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiv9euqTteGBIFWZCcGutTvAm2MFYlP-E",
  authDomain: "healthcareai-a5e07.firebaseapp.com",
  projectId: "healthcareai-a5e07",
  storageBucket: "healthcareai-a5e07.firebasestorage.app",
  messagingSenderId: "1057872282232",
  appId: "1:1057872282232:web:fe96d9033315601c1de38d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
