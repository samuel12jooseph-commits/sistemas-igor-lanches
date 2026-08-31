import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAisxvEK2Bgzz-DN8oOschr853dhLH7DGI",
  authDomain: "igor-lanches.firebaseapp.com",
  projectId: "igor-lanches",
  storageBucket: "igor-lanches.firebasestorage.app",
  messagingSenderId: "165572135221",
  appId: "1:165572135221:web:8f9066cdbc9f480e62a47c",
  measurementId: "G-STM5DCEHNH"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
