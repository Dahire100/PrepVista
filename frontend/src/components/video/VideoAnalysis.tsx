import React, { useState } from 'react';
import { Upload, Download, RotateCcw, Eye, Mic, Volume2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import CircularProgress from '../ui/CircularProgress';
import { analysisAPI } from '../../services/api';

interface VideoAnalysisProps {
  onNavigate?: (section: string) => void;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ onNavigate = () => {} }) => {
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const analyzeVideo = async () => {
    if (!videoFile) {
      setError('No video file to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Call backend API
      const response = await analysisAPI.analyzeVideo(
        videoFile,
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      // Map backend response to frontend format
      setAnalysisResults({
        eyeContactPercentage: Math.round(response.results.video_analysis.eye_contact_score),
        postureScore: Math.round(response.results.video_analysis.posture_score),
        gestureAnalysis: "Natural and confident hand gestures",
        emotionalAnalysis: "Positive and engaged demeanor",
        speechQuality: response.results.audio_analysis 
          ? Math.round((response.results.audio_analysis.wpm / 150) * 100) 
          : 80,
        confidence: Math.round(response.results.video_analysis.confidence_score),
        overallScore: response.results.overall_score,
        improvements: [
          response.results.video_analysis.eye_contact_score < 70 
            ? "Maintain eye contact for longer periods" 
            : "Continue maintaining good eye contact",
          response.results.audio_analysis && response.results.audio_analysis.wpm > 160
            ? "Speak slightly slower for better clarity"
            : "Good speaking pace",
          response.results.video_analysis.posture_score < 70
            ? "Improve your posture"
            : "Maintain your good posture",
          response.results.audio_analysis && response.results.audio_analysis.filler_count > 5
            ? `Reduce filler words (detected ${response.results.audio_analysis.filler_count})`
            : "Good speech clarity"
        ],
        strengths: [
          response.results.video_analysis.posture_score > 75 && "Excellent posture",
          response.results.video_analysis.eye_contact_score > 75 && "Strong eye contact",
          response.results.video_analysis.confidence_score > 75 && "Confident presentation",
          response.results.audio_analysis && response.results.audio_analysis.filler_count < 3 && "Clear articulation"
        ].filter(Boolean),
        summary: response.summary
      });

      setAnalysisId(response.analysis_id);

    } catch (error: any) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('video/')) {
        setError('Please upload a valid video file');
        return;
      }

      const url = URL.createObjectURL(file);
      setRecordedVideo(url);
      setVideoFile(file);
      setError(null);
    }
  };

  const downloadReport = async () => {
    if (!analysisId) {
      setError('No report available to download');
      return;
    }

    try {
      await analysisAPI.downloadReport(analysisId);
    } catch (error: any) {
      setError('Failed to download report: ' + error.message);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setRecordedVideo(null);
    setVideoFile(null);
    setAnalysisId(null);
    setError(null);
    setUploadProgress(0);
  };

  if (analysisResults) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900">Video Analysis Results</h1>
          <Button
            onClick={resetAnalysis}
            variant="secondary"
          >
            <RotateCcw size={18} className="mr-2" />
            New Analysis
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Playback */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Interview Video</h2>
              {recordedVideo && (
                <video
                  src={recordedVideo}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              )}
            </Card>

            {/* Overall Score */}
            <Card>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Overall Performance</h2>
                <CircularProgress 
                  value={analysisResults.overallScore} 
                  size={150}
                  color="#10B981"
                />
                <p className="text-lg font-medium text-gray-600 mt-4">
                  {analysisResults.overallScore >= 80 
                    ? "Excellent! You're showing strong interview skills"
                    : analysisResults.overallScore >= 60
                    ? "Good job! Keep practicing to improve further"
                    : "Keep practicing - you'll get better with time"}
                </p>
              </div>
            </Card>

            {/* AI Summary */}
            {analysisResults.summary && (
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis Summary</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {analysisResults.summary}
                </p>
              </Card>
            )}

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Strengths</h3>
                <div className="space-y-3">
                  {analysisResults.strengths.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                <div className="space-y-3">
                  {analysisResults.improvements.map((improvement: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={downloadReport}>
                  <Download size={18} className="mr-2" />
                  Download Report
                </Button>
                <Button variant="secondary" className="w-full" onClick={resetAnalysis}>
                  Analyze Another Video
                </Button>
              </div>
            </Card>

            {/* Detailed Metrics Cards */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Eye Contact</h3>
                <Eye size={20} className="text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Percentage</span>
                  <span className="text-sm font-medium">{analysisResults.eyeContactPercentage}%</span>
                </div>
                <ProgressBar value={analysisResults.eyeContactPercentage} color="primary" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Posture</h3>
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="text-sm font-medium">{analysisResults.postureScore}%</span>
                </div>
                <ProgressBar value={analysisResults.postureScore} color="success" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Speech Quality</h3>
                <Mic size={20} className="text-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clarity</span>
                  <span className="text-sm font-medium">{analysisResults.speechQuality}%</span>
                </div>
                <ProgressBar value={analysisResults.speechQuality} color="warning" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Confidence</h3>
                <Volume2 size={20} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Level</span>
                  <span className="text-sm font-medium">{analysisResults.confidence}%</span>
                </div>
                <ProgressBar value={analysisResults.confidence} color="danger" />
              </div>
            </Card>

            {/* Next Steps Card */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Live Interview</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Ready for a real-time interview simulation?
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onNavigate('live-interview')}
                >
                  Start Live Session →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Interview Practice</h1>
        <p className="text-gray-600 mt-2">
          Practice your interview skills with AI-powered video analysis and feedback
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview or Upload Area */}
          <Card>
            {!recordedVideo ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload a video file for analysis
                </h3>
                <p className="text-gray-600 mb-2">
                  Max file size: 100MB
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Formats: MP4, WebM, MOV
                </p>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={handleFileUpload}
                />
                <Button
                  size="lg"
                  onClick={() => document.getElementById('video-upload')?.click()}
                >
                  <Upload size={20} className="mr-2" />
                  Choose File
                </Button>
              </div>
            ) : (
              <div>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                  <video
                    src={recordedVideo}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
                
                <div className="flex justify-center items-center space-x-4">
                  <Button onClick={analyzeVideo} size="lg" disabled={!videoFile || isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
                  </Button>
                  <Button 
                    onClick={resetAnalysis} 
                    variant="secondary"
                    disabled={isAnalyzing}
                  >
                    <RotateCcw size={18} className="mr-2" />
                    Upload Different Video
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Recording Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Look directly at the camera for good eye contact</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Sit up straight and maintain good posture</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Speak clearly and at a moderate pace</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p>Use natural hand gestures to emphasize points</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">What We Analyze</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Eye size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700">Eye contact percentage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Body posture and positioning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mic size={16} className="text-purple-500" />
                <span className="text-sm text-gray-700">Speech clarity and pace</span>
              </div>
              <div className="flex items-center space-x-3">
                <Volume2 size={16} className="text-red-500" />
                <span className="text-sm text-gray-700">Confidence and engagement</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {isAnalyzing && (
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyzing Your Video
            </h3>
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your eye contact, posture, speech quality, and overall confidence...
            </p>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            {uploadProgress === 100 && (
              <p className="text-sm text-gray-600 mt-2">
                Processing video... This may take 30-60 seconds
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoAnalysis;