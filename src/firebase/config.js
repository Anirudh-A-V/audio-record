import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5J9TBDCva_56KWLWcOSxGL6KbqVYkMmk",
  authDomain: "audio-recorder-2002911.firebaseapp.com",
  projectId: "audio-recorder-2002911",
  storageBucket: "audio-recorder-2002911.appspot.com",
  messagingSenderId: "719837226838",
  appId: "1:719837226838:web:722c9473caf94d43cb58f7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const timestamp = serverTimestamp();