import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuZbO2DDSbnO_9hIIAFP0A8o0Wi2FzUhg",
  authDomain: "studio-1742912828-cb958.firebaseapp.com",
  projectId: "studio-1742912828-cb958",
  storageBucket: "studio-1742912828-cb958.firebasestorage.app",
  messagingSenderId: "698656713592",
  appId: "1:698656713592:web:cb28d18c9d7311c6def68d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
