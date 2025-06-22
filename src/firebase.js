import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBb1cppePmh5lCdao6w_4lUZzTdrhCp_YE",
  authDomain: "gym-app-e8c81.firebaseapp.com",
  projectId: "gym-app-e8c81",
  storageBucket: "gym-app-e8c81.firebasestorage.app",
  messagingSenderId: "887900279912",
  appId: "1:887900279912:web:72ced031b92cbd7f4e57dd",
  measurementId: "G-RJPQ0N1SYR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics }; 