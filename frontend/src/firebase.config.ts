import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBId8TBWsOkjPDJ8xboSrb5eDeN7S_dxNs",
  authDomain: "bridgesoft-70f69.firebaseapp.com",
  projectId: "bridgesoft-70f69",
  storageBucket: "bridgesoft-70f69.firebasestorage.app",
  messagingSenderId: "486369182507",
  appId: "1:486369182507:web:7288d36c2c16db4130fb6e",
  measurementId: "G-1C40RKLK8L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
