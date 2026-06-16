import { initializeApp } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = { 
	apiKey: "AIzaSyDUTVFgrJZFLxNsJtlcDHkRwuiv9qUNuc8", 
	authDomain: "games-52d8a.firebaseapp.com", 
	projectId: "games-52d8a", 
	storageBucket: "games-52d8a.firebasestorage.app", 
	messagingSenderId: "761846513352", 
	appId: "1:761846513352:web:48fc0af6361e8962eb6ffd", 
	measurementId: "G-EVT80HBP3R" };


const app = initializeApp(firebaseConfig); 
export const db = getFirestore(app);