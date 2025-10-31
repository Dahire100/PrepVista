import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ResumeAnalysis from './components/resume/ResumeAnalysis';
import VideoAnalysis from './components/video/VideoAnalysis';
import LiveInterview from './components/interview/LiveInterview';
import Reports from './components/reports/Reports';
import QuestionLibrary from './components/library/QuestionLibrary';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import Help from './components/help/Help';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import { User, DashboardStats } from './types';
import { authAPI, analysisAPI } from './services/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    resumeScore: 0,
    interviewCount: 0,
    successRate: 0,
    totalSessions: 0,
    improvement: 0
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const { user: backendUser } = await authAPI.getCurrentUser();
          // Map backend user to your User type
          setUser({
            id: backendUser._id,
            name: backendUser.full_name,
            email: backendUser.email,
            university: '', // Add to profile later
            course: '', // Add to profile later
            createdAt: new Date().toISOString()
          });
          
          // Fetch user stats
          await fetchStats();
        } catch (error) {
          console.error('Auth check failed:', error);
          authAPI.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await analysisAPI.getStats();
      console.log('Stats from backend:', statsData); // Debug log
      
      // Use REAL data from backend
      setStats({
        resumeScore: statsData.average_resume_score || 0,
        interviewCount: statsData.total_interviews || 0,
        successRate: statsData.success_rate || 0,
        totalSessions: statsData.total_analyses || 0,
        improvement: statsData.improvement_rate || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setUser({
        id: response.user._id,
        name: response.user.full_name,
        email: response.user.email,
        university: '',
        course: '',
        createdAt: new Date().toISOString()
      });
      await fetchStats();
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const handleSignUp = async (data: any) => {
    try {
      const response = await authAPI.register(
        data.email,
        data.password,
        data.name
      );
      setUser({
        id: response.user._id,
        name: response.user.full_name,
        email: response.user.email,
        university: data.university || '',
        course: data.course || '',
        createdAt: new Date().toISOString()
      });
      await fetchStats();
    } catch (error: any) {
      console.error('Sign up failed:', error);
      throw new Error(error.message || 'Sign up failed');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard stats={stats} userName={user?.name || ''} />;
      case 'resume':
        return <ResumeAnalysis />;
      case 'video':
        return <VideoAnalysis onNavigate={setActiveSection} />;
      case 'interview':
        return <LiveInterview />;
      case 'reports':
        return <Reports />;
      case 'library':
        return <QuestionLibrary />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      case 'help':
        return <Help />;
      default:
        return <Dashboard stats={stats} userName={user?.name || ''} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Show auth screens if user is not logged in
  if (!user) {
    if (authMode === 'signup') {
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
    
    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToSignUp={() => setAuthMode('signup')}
      />
    );
  }

  return (
    <Layout
      user={user}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;