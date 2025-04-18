// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  auth, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  createUserProfile, 
  getUserProfile 
} from './firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userProfile = await getUserProfile(user.uid);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: userProfile?.name || '',
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set basic user info without profile details
          setCurrentUser({
            uid: user.uid,
            email: user.email
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      // Create authentication record
      const userCredential = await registerWithEmail(userData.email, userData.password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        email: userData.email,
        name: userData.name || ''
      });
      
      // currentUser will be set by the onAuthStateChanged listener
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const { email, password } = credentials;
      await loginWithEmail(email, password);
      // currentUser will be set by the onAuthStateChanged listener
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      // currentUser will be cleared by the onAuthStateChanged listener
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      register,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);