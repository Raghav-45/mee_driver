// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChazVEVIYWsTzfQ7W-JoGuYbN_bTmKLas",
  authDomain: "mev-test-321af.firebaseapp.com",
  projectId: "mev-test-321af",
  storageBucket: "mev-test-321af.appspot.com",
  messagingSenderId: "1094204857465",
  appId: "1:1094204857465:web:12ebca7c969550e8e048a8",
  measurementId: "G-5PDBR70WNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }