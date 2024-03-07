import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAy5ze9q-OeLoXQlctaIxjRfbn36d0_HYM",
  authDomain: "socialmedia-d41db.firebaseapp.com",
  projectId: "socialmedia-d41db",
  storageBucket: "socialmedia-d41db.appspot.com",
  messagingSenderId: "351138754514",
  appId: "1:351138754514:web:58f24572b605df9752620b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// gAuth
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async ()=>{
    let user = null;
    await signInWithPopup(auth, provider)
    .then((result)=> {
        user = result.user
        // console.log(user)
    })
    .catch((error) =>{
        console.log(error)
    })
    return user;
}

