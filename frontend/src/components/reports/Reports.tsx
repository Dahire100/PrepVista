import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Eye, FileText, Video, Users } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import CircularProgress from '../ui/CircularProgress';
import { analysisAPI } from '../../services/api';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [reportData, setReportData] = useState({
    overview: {
      totalSessions: 0,
      averageScore: 0,
      improvement: 0,
      timeSpent: 0
    },
    recentReports: [] as any[],
    skillsBreakdown: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      leadership: 0,
      teamwork: 0
    },
    progressData: [] as any[]
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedType]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch stats from backend
      const stats = await analysisAPI.getStats();
      
      // Fetch analysis history
      const history = await analysisAPI.getAnalysisHistory();
      
      // Calculate overview data
      const overview = {
        totalSessions: stats.total_analyses || 0,
        averageScore: Math.round(stats.average_resume_score || 0),
        improvement: Math.round(stats.improvement_rate || 0),
        timeSpent: parseFloat((stats.total_analyses * 0.5).toFixed(1))
      };
      
      // Map history to recent reports with proper data extraction
      const recentReports = history.slice(0, 10).map((item: any) => {
        let score = 0;
        if (item.data) {
          if (item.analysis_type === 'resume') {
            score = item.data.ats_score || 0;
          } else if (item.analysis_type === 'video') {
            score = item.data.overall_score || 0;
          } else if (item.analysis_type === 'interview') {
            score = item.data.average_score || 0;
          }
        }
        
        return {
          id: item._id,
          type: item.analysis_type,
          title: formatReportTitle(item.analysis_type),
          date: new Date(item.created_at).toISOString().split('T')[0],
          score: Math.round(score),
          status: 'completed'
        };
      });
      
      const skillsBreakdown = calculateSkillsBreakdown(history);
      const progressData = generateProgressData(history);
      
      setReportData({
        overview,
        recentReports,
        skillsBreakdown,
        progressData
      });
      
    } catch (err: any) {
      console.error('Failed to fetch report data:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const formatReportTitle = (type: string) => {
    switch (type) {
      case 'resume':
        return 'Resume Analysis Report';
      case 'video':
        return 'Video Interview Practice';
      case 'interview':
        return 'Live Technical Interview';
      default:
        return 'Analysis Report';
    }
  };

  const calculateSkillsBreakdown = (history: any[]) => {
    if (!history || history.length === 0) {
      return { technical: 0, communication: 0, problemSolving: 0, leadership: 0, teamwork: 0 };
    }

    let technical = 0, communication = 0, problemSolving = 0, leadership = 0, teamwork = 0, count = 0;

    history.forEach((item: any) => {
      if (item.data) {
        if (item.analysis_type === 'resume') {
          technical += item.data.technical_skills_score || 70;
          communication += item.data.communication_score || 70;
          problemSolving += 75;
          leadership += 70;
          teamwork += 75;
          count++;
        } else if (item.analysis_type === 'video') {
          communication += item.data.confidence_score || item.data.overall_score || 70;
          technical += item.data.posture_score || 70;
          problemSolving += item.data.eye_contact_score || 70;
          leadership += item.data.confidence_score || 70;
          teamwork += item.data.engagement_score || 70;
          count++;
        } else if (item.analysis_type === 'interview') {
          const avgScore = item.data.average_score || 70;
          technical += avgScore;
          communication += avgScore;
          problemSolving += avgScore;
          leadership += avgScore - 10;
          teamwork += avgScore - 10;
          count++;
        }
      }
    });

    if (count === 0) return { technical: 0, communication: 0, problemSolving: 0, leadership: 0, teamwork: 0 };

    return {
      technical: Math.round(technical / count),
      communication: Math.round(communication / count),
      problemSolving: Math.round(problemSolving / count),
      leadership: Math.round(leadership / count),
      teamwork: Math.round(teamwork / count)
    };
  };

  const generateProgressData = (history: any[]) => {
    if (!history || history.length === 0) {
      return [
        { month: 'Sep', score: 0 },
        { month: 'Oct', score: 0 },
        { month: 'Nov', score: 0 },
        { month: 'Dec', score: 0 },
        { month: 'Jan', score: 0 }
      ];
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyScores: { [key: string]: number[] } = {};

    history.forEach((item: any) => {
      const date = new Date(item.created_at);
      const monthKey = monthNames[date.getMonth()];
      
      let score = 0;
      if (item.data) {
        if (item.analysis_type === 'resume') {
          score = item.data.ats_score || 0;
        } else if (item.analysis_type === 'video') {
          score = item.data.overall_score || 0;
        } else if (item.analysis_type === 'interview') {
          score = item.data.average_score || 0;
        }
      }
      
      if (!monthlyScores[monthKey]) monthlyScores[monthKey] = [];
      monthlyScores[monthKey].push(score);
    });

    const now = new Date();
    const last5Months = [];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      const scores = monthlyScores[monthKey] || [];
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      
      last5Months.push({ month: monthKey, score: avgScore });
    }

    return last5Months;
  };

  const handleExportData = async () => {
    try {
      const csvContent = [
        ['Type', 'Title', 'Date', 'Score', 'Status'],
        ...reportData.recentReports.map(r => [r.type, r.title, r.date, r.score, r.status])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-prep-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export data');
    }
  };

  const handleViewReport = async (reportId: string) => {
    console.log('Viewing report:', reportId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resume': return <FileText size={16} className="text-blue-500" />;
      case 'video': return <Video size={16} className="text-green-500" />;
      case 'interview': return <Users size={16} className="text-purple-500" />;
      default: return <BarChart3 size={16} className="text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredReports = selectedType === 'all' 
    ? reportData.recentReports 
    : reportData.recentReports.filter(r => r.type === selectedType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-2">Failed to load reports</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchReportData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Track your interview preparation progress and performance</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="secondary" onClick={handleExportData}>
            <Download size={18} className="mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalSessions}</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  {reportData.overview.totalSessions > 0 ? '+12% from last month' : 'Start practicing!'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.averageScore}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  {reportData.overview.improvement > 0 ? `+${reportData.overview.improvement}% improvement` : 'Keep going!'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Improvement</p>
              <p className="text-2xl font-bold text-gray-900">+{reportData.overview.improvement}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm text-green-600">Since last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.overview.timeSpent}h</p>
              <div className="flex items-center mt-2">
                <Calendar size={16} className="text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">This month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Performance Trend</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-black text-white rounded-lg">Score</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Sessions</button>
              </div>
            </div>
            
            {reportData.progressData.length > 0 && reportData.progressData.some(d => d.score > 0) ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {reportData.progressData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                      <div 
                        className="w-full bg-black rounded-t-lg absolute bottom-0 transition-all duration-1000"
                        style={{ height: `${(data.score / 100) * 200}px` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 mt-2">{data.month}</span>
                    <span className="text-xs text-gray-500">{data.score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No data available yet. Start practicing to see your progress!</p>
              </div>
            )}
          </Card>

          {/* Recent Reports */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="resume">Resume Analysis</option>
                <option value="video">Video Practice</option>
                <option value="interview">Live Interview</option>
              </select>
            </div>

            {filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(report.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">{report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-semibold ${getScoreColor(report.score)}`}>
                          {report.score}%
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{report.status}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No reports found. Start your first analysis!</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Breakdown */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Skills Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(reportData.skillsBreakdown).map(([skill, score]) => (
                <div key={skill}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {skill.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm text-gray-600">{score}%</span>
                  </div>
                  <ProgressBar value={score} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Overall Performance */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Overall Performance</h3>
            <div className="text-center">
              <CircularProgress 
                value={reportData.overview.averageScore} 
                size={120}
                color="#10B981"
              />
              <p className="text-sm text-gray-600 mt-4">
                {reportData.overview.averageScore >= 80 
                  ? "You're performing above average!"
                  : reportData.overview.averageScore >= 60
                  ? "Good progress! Keep improving!"
                  : reportData.overview.totalSessions > 0
                  ? "Keep practicing to improve!"
                  : "Start your first analysis!"}
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download size={16} className="mr-2" />
                Download Full Report
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Calendar size={16} className="mr-2" />
                Schedule Review
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <BarChart3 size={16} className="mr-2" />
                Compare with Peers
              </Button>
            </div>
          </Card>

          {/* Recommendations */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {reportData.skillsBreakdown.communication < 75 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">Focus on Communication</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Your communication score can be improved with more practice
                  </p>
                </div>
              )}
              {reportData.skillsBreakdown.technical >= 80 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 text-sm">Great Technical Skills</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Keep up the excellent technical performance
                  </p>
                </div>
              )}
              {reportData.overview.totalSessions === 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 text-sm">Start Practicing</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Begin with a resume analysis or video practice session
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;