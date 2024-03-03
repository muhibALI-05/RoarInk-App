import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCtJV8LK4EV3YXcrksVQRIjCzAbZv6u5N8",
    authDomain: "roarink-66a52.firebaseapp.com",
    projectId: "roarink-66a52",
    storageBucket: "roarink-66a52.appspot.com",
    messagingSenderId: "400720009934",
    appId: "1:400720009934:web:6960a8979132d48c8c8e9f",
    measurementId: "G-P85D3PFWJ4"
  };


export const app = initializeApp(firebaseConfig)
 // export const auth = getAuth(app)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app)