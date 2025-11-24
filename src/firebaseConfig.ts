import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_REACT_APP_FIREBASE_API_KEY_VALUE",
  authDomain: "PASTE_YOUR_REACT_APP_FIREBASE_AUTH_DOMAIN_VALUE",
  projectId: "PASTE_YOUR_REACT_APP_FIREBASE_PROJECT_ID_VALUE",
  storageBucket: "PASTE_YOUR_REACT_APP_FIREBASE_STORAGE_BUCKET_VALUE",
  messagingSenderId: "PASTE_YOUR_REACT_APP_FIREBASE_MESSAGING_SENDER_ID_VALUE",
  appId: "PASTE_YOUR_REACT_APP_FIREBASE_APP_ID_VALUE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
