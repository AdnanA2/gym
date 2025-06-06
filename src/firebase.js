import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  // TODO: Replace with your Firebase config object
  apiKey: "YOUR_API_KEY",
  authDomain: "mentzer-tracker.firebaseapp.com",
  projectId: "mentzer-tracker",
  storageBucket: "mentzer-tracker.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 