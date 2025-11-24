import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGeGDcQ1zVbtQVFYkHfSue5OIIPuIcS6Y",
  authDomain: "screener-e8718.firebaseapp.com",
  projectId: "screener-e8718",
  storageBucket: "screener-e8718.appspot.com",
  messagingSenderId: "190387003372",
  appId: "1:190387003372:web:32cbd278708199a96aaac9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };