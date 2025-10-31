import React, { useEffect, useState } from 'react';
import { FileText, Video, Users, BarChart3, Calendar, Award, Clock, Target } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import CircularProgress from '../ui/CircularProgress';
import { DashboardStats } from '../../types';
import { getAnalysisHistory } from '../../services/api';

interface DashboardProps {
  stats: DashboardStats;
  userName: string;
}

interface Analysis {
  _id: string;
  analysis_type: string;
  data: any;
  created_at: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, userName }) => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await getAnalysisHistory(5);
      const analyses: Analysis[] = response.analyses || [];
      
      // Transform backend data to match frontend format
      const activities = analyses.map((analysis) => {
        let score = 0;
        let action = '';
        
        switch (analysis.analysis_type) {
          case 'resume':
            score = analysis.data?.ats_score || 0;
            action = 'Resume analyzed';
            break;
          case 'video':
            score = analysis.data?.overall_score || 0;
            action = 'Video practice completed';
            break;
          case 'interview':
            score = analysis.data?.average_score || 0;
            action = 'Mock interview finished';
            break;
          default:
            score = 0;
            action = 'Analysis completed';
        }
        
        return {
          id: analysis._id,
          type: analysis.analysis_type,
          action,
          score: Math.round(score),
          time: getTimeAgo(analysis.created_at)
        };
      });
      
      setRecentActivity(activities);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      setRecentActivity([]);
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const upcomingInterviews = [
    { id: 1, company: 'Google', position: 'Software Engineer', date: '2024-01-15', time: '10:00 AM' },
    { id: 2, company: 'Microsoft', position: 'Product Manager', date: '2024-01-18', time: '2:30 PM' },
    { id: 3, company: 'Amazon', position: 'Data Scientist', date: '2024-01-20', time: '11:15 AM' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
          <p className="text-gray-600 mt-1">Ready to ace your next interview?</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <Calendar size={18} className="mr-2" />
            Schedule Interview
          </Button>
          <Button>
            <Target size={18} className="mr-2" />
            Start Practice
          </Button>
        </div>
      </div>

      {/* Stats Grid - Using Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Resume Score"
          value={`${stats.resumeScore}%`}
          change={12}
          changeLabel="vs last month"
          icon={<FileText size={24} />}
          color="primary"
        />
        <StatsCard
          title="Practice Sessions"
          value={stats.interviewCount}
          change={25}
          changeLabel="this week"
          icon={<Video size={24} />}
          color="success"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          change={8}
          changeLabel="improvement"
          icon={<Users size={24} />}
          color="warning"
        />
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          change={stats.improvement}
          changeLabel="this month"
          icon={<BarChart3 size={24} />}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
              <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                <option>This Week</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <CircularProgress 
                  value={stats.resumeScore} 
                  label="Resume Score"
                  color="#000000"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Interview Skills</span>
                    <span className="text-sm text-gray-500">{stats.successRate}%</span>
                  </div>
                  <ProgressBar value={stats.successRate} color="success" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Communication</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <ProgressBar value={85} color="primary" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Confidence</span>
                    <span className="text-sm text-gray-500">78%</span>
                  </div>
                  <ProgressBar value={78} color="warning" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No activity yet. Start by analyzing your resume or practicing interviews!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        {activity.type === 'resume' && <FileText size={18} className="text-white" />}
                        {activity.type === 'video' && <Video size={18} className="text-white" />}
                        {activity.type === 'interview' && <Users size={18} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{activity.score}%</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Interviews</h3>
              <Clock size={18} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{interview.company}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{interview.position}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{interview.date}</span>
                    <span>{interview.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View All Interviews
            </Button>
          </Card>

          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Award size={18} className="text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Achievements</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Award size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">First Interview</p>
                  <p className="text-xs text-gray-500">Completed your first mock interview</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Resume Master</p>
                  <p className="text-xs text-gray-500">Achieved 90+ resume score</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 opacity-50">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Award size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Video Expert</p>
                  <p className="text-xs text-gray-400">Complete 10 video practices</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;