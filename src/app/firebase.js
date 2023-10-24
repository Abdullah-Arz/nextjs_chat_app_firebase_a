import { initializeApp } from "firebase/app";
import { getAuth } from  "firebase/auth";
import { getStorage } from "firebase/storage"; 
import { getFirestore  } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyCwgTLS72HE0mym3BXWTy9UvKN7EiHC-38",
  authDomain: "next-js-chat-web-app.firebaseapp.com",
  projectId: "next-js-chat-web-app",
  storageBucket: "next-js-chat-web-app.appspot.com",
  messagingSenderId: "137589502169",
  appId: "1:137589502169:web:d9aa76bf951edfba450ec8",
  measurementId: "G-WFM4BZ841H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();