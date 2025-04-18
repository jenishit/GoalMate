import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginRegister.css';

function LoginRegister() {
  const [activeTab, setActiveTab] = useState('login');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <div className="logo">Goalmate</div>
      <div className="subtitle">Your AI-powered goal achievement companion</div>
      
      <div className="form-container">
        <div className="tab-container">
          <div 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => handleTabChange('login')}
          >
            Login
          </div>
          <div 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => handleTabChange('register')}
          >
            Register
          </div>
        </div>
        
        {activeTab === 'login' ? (
          <LoginForm />
        ) : (
          <RegisterForm />
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Use the login function from AuthContext
      await login({ email, password });
      
      // If login is successful, redirect to main GoalMate page
      navigate('/goalmate');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input 
          type="email" 
          id="login-email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input 
          type="password" 
          id="login-password" 
          placeholder="Enter your password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          disabled={isLoading}
        />
      </div>
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
      <div className="form-footer">
        <a href="./LoginRegister">Forgot password?</a>
      </div>
    </form>
  );
}

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the register function from AuthContext
      await register({ name, email, password });
      
      // If registration is successful, user will be automatically logged in by the register function
      // Redirect to main GoalMate page
      navigate('/goalmate');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="register-name">Full Name</label>
        <input 
          type="text" 
          id="register-name" 
          placeholder="Enter your full name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="register-email">Email</label>
        <input 
          type="email" 
          id="register-email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="register-password">Password</label>
        <input 
          type="password" 
          id="register-password" 
          placeholder="Create a password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="register-confirm-password">Confirm Password</label>
        <input 
          type="password" 
          id="register-confirm-password" 
          placeholder="Confirm your password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
          disabled={isLoading}
        />
      </div>
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

export default LoginRegister;