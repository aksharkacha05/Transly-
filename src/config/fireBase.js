import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBH-AF2K-NjrMwntHWsp6idzVXiWo_hcbA",
  authDomain: "translyapp-adde4.firebaseapp.com",
  projectId: "translyapp-adde4",
  storageBucket: "translyapp-adde4.firebasestorage.app",
  messagingSenderId: "377351325293",
  appId: "1:377351325293:web:1fbeffc6ed394bfa53e164",
  measurementId: "G-3WWS1KQ1RE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);