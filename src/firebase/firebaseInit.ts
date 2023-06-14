import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDihPBMdsfcZSKKMJYPevcEnUUUMhnb-zQ",
  authDomain: "sub-test-9cc8b.firebaseapp.com",
  projectId: "sub-test-9cc8b",
  storageBucket: "sub-test-9cc8b.appspot.com",
  messagingSenderId: "436304842354",
  appId: "1:436304842354:web:8847dd6ed5c599f17fbceb",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export { timestamp };
export default firebaseApp.firestore();
const fire = initializeApp(firebaseConfig);
export const auth = getAuth(fire);
