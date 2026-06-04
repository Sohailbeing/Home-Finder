// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-project-7ce83.firebaseapp.com",
  projectId: "mern-project-7ce83",
  storageBucket: "mern-project-7ce83.appspot.com", // Corrected
  messagingSenderId: "993436186798",
  appId: "1:993436186798:web:9667b297c982a6b23dd53f",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
