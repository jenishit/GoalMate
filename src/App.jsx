import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginRegister from './LoginRegister';
import Goalmate from './Goalmate';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/goalmate" element={
          <ProtectedRoute>
            <Goalmate />
          </ProtectedRoute>
        } />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Catch all other routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;