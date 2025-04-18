// src/Goalmate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoadmapFromGemini } from './geminiApi';
import './Goalmate.css';
import { useAuth } from './AuthContext';
import { saveGoal, getUserGoals, deleteUserGoal } from './firebaseConfig';
import { 
  MessageSquarePlus, 
  Calendar, 
  List, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  PlusCircle,
  ChevronRight,
  AlertTriangle,
  LogOut
} from 'lucide-react';

function Goalmate() {
  // Navigation and auth hooks
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // State management
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState({
    id: null,
    title: '',
    description: '',
    dueDate: '',
    roadmap: [],
    created: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [activeTab, setActiveTab] = useState('create');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);


  // Load saved goals from database on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoadingGoals(true);
        const userGoals = await getUserGoals(currentUser.uid);
        setGoals(userGoals);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError('Failed to load your goals. Please try refreshing the page.');
      } finally {
        setLoadingGoals(false);
      }
    };
    
    fetchGoals();
  }, [currentUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    }
  };

  // Generate roadmap with AI
  const generateRoadmapWithAI = async () => {
    if (!currentUser?.uid) {
      setError('You must be logged in to create goals.');
      return;
    }
    
    if (!currentGoal.title || !currentGoal.description) {
      setError('Please provide both a title and description for your goal');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const topic = `${currentGoal.title}: ${currentGoal.description}${currentGoal.dueDate ? ` (Due by: ${currentGoal.dueDate})` : ''}`;
      const steps = await getRoadmapFromGemini(topic);
  
      const roadmapItems = steps.map((step, index) => ({
        id: `${Date.now()}-${index}`,
        text: step,
        completed: false
      }));
  
      const goalId = currentGoal.id || Date.now().toString();
      
      const updatedGoal = {
        ...currentGoal,
        id: goalId,
        userId: currentUser.uid,
        roadmap: roadmapItems,
        created: currentGoal.created || new Date().toISOString()
      };
  
      // Save to database
      await saveGoal(currentUser.uid, updatedGoal);
      
      // Update local state
      if (currentGoal.id) {
        setGoals(goals.map(g => g.id === currentGoal.id ? updatedGoal : g));
      } else {
        setGoals([...goals, updatedGoal]);
      }
  
      setCurrentGoal(updatedGoal);
      setActiveTab('roadmap');
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle completion status of a roadmap item
  const toggleItemCompletion = async (id) => {
    if (!currentUser?.uid) return;
    
    const updatedRoadmap = currentGoal.roadmap.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    const updatedGoal = { ...currentGoal, roadmap: updatedRoadmap };
    
    try {
      // Save changes to database
      await saveGoal(currentUser.uid, updatedGoal);
      
      // Update local state
      setCurrentGoal(updatedGoal);
      setGoals(goals.map(g => g.id === currentGoal.id ? updatedGoal : g));
    } catch (err) {
      console.error('Error updating goal:', err);
      setError('Failed to update goal. Please try again.');
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!currentGoal.roadmap || currentGoal.roadmap.length === 0) return 0;
    const completedItems = currentGoal.roadmap.filter(item => item.completed).length;
    return Math.round((completedItems / currentGoal.roadmap.length) * 100);
  };

  // Create a new goal
  const createNewGoal = () => {
    setCurrentGoal({
      id: null,
      title: '',
      description: '',
      dueDate: '',
      roadmap: [],
      created: null
    });
    setActiveTab('create');
  };

  // Load an existing goal
  const loadGoal = (goal) => {
    setCurrentGoal(goal);
    setActiveTab('roadmap');
  };

  // Delete a goal
  const deleteGoal = async (id) => {
    if (!currentUser?.uid) return;
    
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        // Delete from database
        await deleteUserGoal(currentUser.uid, id);
        
        // Update local state
        const updatedGoals = goals.filter(g => g.id !== id);
        setGoals(updatedGoals);
        
        if (currentGoal.id === id) {
          createNewGoal();
        }
      } catch (err) {
        console.error('Error deleting goal:', err);
        setError('Failed to delete goal. Please try again.');
      }
    }
  };

  // Display loading state while fetching goals
  if (loadingGoals) {
    return (
      <div className="goalmate-loading">
        <h2>Loading your goals...</h2>
        <div className="goalmate-spinner"></div>
      </div>
    );
  }

  return (
    <div className="goalmate-container">
      <header className="goalmate-header">
        <div>
          <h1 className="goalmate-title">Goalmate</h1>
          <p className="goalmate-subtitle">Your AI-powered goal achievement companion</p>
        </div>
        <div className="goalmate-user-info">
          {currentUser && (
            <span className="goalmate-user-name">Hello, {currentUser.name || currentUser.email}</span>
          )}
          <div className="goalmate-actions">
            <button 
              className="goalmate-settings-button"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="goalmate-settings-panel">
          <h2>Settings</h2>
          <div className="goalmate-setting-group">
            {/* API Key section commented out */}
          </div>
          <button 
            className="goalmate-primary-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}

      <div className="goalmate-layout">
        <div className="goalmate-sidebar">
          <div className="goalmate-goals-header">
            <h2>Your Goals</h2>
            <button 
              className="goalmate-new-button" 
              onClick={createNewGoal}
            >
              <PlusCircle size={16} />
            </button>
          </div>
          <div className="goalmate-goals-list">
            {goals.length === 0 ? (
              <div className="goalmate-empty-state">
                <p>No goals yet. Create your first goal!</p>
              </div>
            ) : (
              goals.map(goal => (
                <div 
                  key={goal.id} 
                  className={`goalmate-goal-item ${currentGoal.id === goal.id ? 'active' : ''}`}
                  onClick={() => loadGoal(goal)}
                >
                  <div className="goalmate-goal-item-content">
                    <h3>{goal.title}</h3>
                    <div className="goalmate-goal-progress">
                      <div className="goalmate-progress-bar">
                        <div 
                          className="goalmate-progress-fill" 
                          style={{ 
                            width: `${goal.roadmap && goal.roadmap.length > 0 
                              ? Math.round((goal.roadmap.filter(item => item.completed).length / goal.roadmap.length) * 100) 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span>{goal.roadmap && goal.roadmap.length > 0 
                        ? Math.round((goal.roadmap.filter(item => item.completed).length / goal.roadmap.length) * 100) 
                        : 0}%</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="goalmate-chevron" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rest of the component remains the same */}
        <div className="goalmate-content">
          <nav className="goalmate-tabs">
            <button
              onClick={() => setActiveTab('create')}
              className={`goalmate-tab ${activeTab === 'create' ? 'active' : ''}`}
            >
              <MessageSquarePlus size={18} className="goalmate-tab-icon" />
              {currentGoal.id ? 'Edit Goal' : 'Create Goal'}
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`goalmate-tab ${activeTab === 'roadmap' ? 'active' : ''}`}
              disabled={!currentGoal.id || !currentGoal.roadmap || currentGoal.roadmap.length === 0}
            >
              <List size={18} className="goalmate-tab-icon" />
              Roadmap
            </button>
          </nav>

          {error && (
            <div className="goalmate-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="goalmate-create-form">
              <div className="goalmate-form-group">
                <label htmlFor="title">Goal Title</label>
                <input
                  id="title"
                  type="text"
                  value={currentGoal.title}
                  onChange={(e) => setCurrentGoal({...currentGoal, title: e.target.value})}
                  placeholder="E.g., Launch my e-commerce store"
                />
              </div>
              
              <div className="goalmate-form-group">
                <label htmlFor="description">Goal Description</label>
                <textarea
                  id="description"
                  value={currentGoal.description}
                  onChange={(e) => setCurrentGoal({...currentGoal, description: e.target.value})}
                  placeholder="Describe your goal in detail, including any specific requirements or constraints"
                  rows={5}
                />
              </div>
              
              <div className="goalmate-form-group">
                <label htmlFor="dueDate">Due Date (Optional)</label>
                <input
                  id="dueDate"
                  type="date"
                  value={currentGoal.dueDate}
                  onChange={(e) => setCurrentGoal({...currentGoal, dueDate: e.target.value})}
                />
              </div>
              
              <div className="goalmate-form-actions">
                {currentGoal.id && (
                  <button
                    onClick={() => deleteGoal(currentGoal.id)}
                    className="goalmate-delete-button"
                  >
                    Delete Goal
                  </button>
                )}
                
                <button
                  onClick={generateRoadmapWithAI}
                  disabled={!currentGoal.title || !currentGoal.description || isLoading}
                  className="goalmate-primary-button"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="goalmate-spinner" />
                      Generating roadmap...
                    </>
                  ) : (
                    <>Generate AI Roadmap</>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && currentGoal.id && (
            <div className="goalmate-roadmap">
              <div className="goalmate-roadmap-header">
                <h2>{currentGoal.title}</h2>
                <p>{currentGoal.description}</p>
                
                {currentGoal.dueDate && (
                  <div className="goalmate-due-date">
                    <Calendar size={16} />
                    <span>Due by: {new Date(currentGoal.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="goalmate-progress-section">
                <h3>Progress</h3>
                <div className="goalmate-progress-container">
                  <div className="goalmate-progress-bar">
                    <div 
                      className="goalmate-progress-fill" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <span className="goalmate-progress-percent">{calculateProgress()}% complete</span>
                </div>
              </div>
              
              <div className="goalmate-roadmap-steps">
                <h3>Roadmap Steps</h3>
                <ul className="goalmate-steps-list">
                  {currentGoal.roadmap && currentGoal.roadmap.map(item => (
                    <li 
                      key={item.id}
                      className={`goalmate-step-item ${item.completed ? 'completed' : ''}`}
                      onClick={() => toggleItemCompletion(item.id)}
                    >
                      {item.completed ? 
                        <CheckCircle size={20} className="goalmate-step-icon completed" /> : 
                        <XCircle size={20} className="goalmate-step-icon" />
                      }
                      <span className="goalmate-step-text">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="goalmate-roadmap-actions">
                <button
                  onClick={() => setActiveTab('create')}
                  className="goalmate-secondary-button"
                >
                  Edit Goal
                </button>
                <button
                  onClick={generateRoadmapWithAI}
                  className="goalmate-refresh-button"
                >
                  <RefreshCw size={16} />
                  Regenerate Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Goalmate;