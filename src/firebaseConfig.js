// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';

// TODO: Replace with your own Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDyX2RM9-MR_vEI1ezpvDJd1FeDK4yNekg",
    authDomain: "goalmoate.firebaseapp.com",
    projectId: "goalmoate",
    storageBucket: "goalmoate.firebasestorage.app",
    messagingSenderId: "700015772610",
    appId: "1:700015772610:web:d218b9efac4974aafa4c5b",
    measurementId: "G-Q8C2V39MKF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication methods
export const loginWithEmail = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

// User methods
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      email: userData.email,
      name: userData.name || '',
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Goals methods
export const saveGoal = async (userId, goalData) => {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalData.id.toString());
    await setDoc(goalRef, goalData);
    return true;
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

export const getUserGoals = async (userId) => {
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const querySnapshot = await getDocs(goalsRef);
    const goals = [];
    querySnapshot.forEach((doc) => {
      goals.push(doc.data());
    });
    return goals;
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

export const deleteUserGoal = async (userId, goalId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId.toString()));
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export { auth, db };