// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEBzPbUMIhonf4EJQdvj8-GQ5tUaXaW0k",
  authDomain: "mee-web-3bb37.firebaseapp.com",
  projectId: "mee-web-3bb37",
  storageBucket: "mee-web-3bb37.appspot.com",
  messagingSenderId: "12781229571",
  appId: "1:12781229571:web:4457cf5deb0acd17bba036"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }