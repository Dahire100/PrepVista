import React, { useState } from 'react';
import { Upload, FileText, Download, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CircularProgress from '../ui/CircularProgress';
import { resumeAPI } from '../../services/api';

const ResumeAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a resume file');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      setError('Please enter a job description (minimum 50 characters)');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call backend API
      const response = await resumeAPI.analyzeResume(selectedFile, jobDescription);
      
      // Map backend response to frontend format
      const results = response.results;
      
      setAnalysis({
        atsScore: results.ats_score,
        matchScore: results.match_score,
        overallRating: results.ats_score >= 80 ? 'A' : results.ats_score >= 60 ? 'B' : 'C',
        candidateInfo: results.candidate_info,
        strengths: results.strengths || [],
        weaknesses: results.weaknesses || [],
        suggestions: results.improvement_tips || [],
        keywordsFound: results.keywords_found || [],
        keywordsMissing: results.keywords_missing || [],
        recommendation: results.recommendation,
        summary: response.summary
      });
      
      setAnalysisId(response.analysis_id);
      
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisId) {
      setError('No report available to download');
      return;
    }

    try {
      await resumeAPI.downloadReport(analysisId);
    } catch (err: any) {
      setError('Failed to download report: ' + err.message);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setSelectedFile(null);
    setJobDescription('');
    setAnalysisId(null);
    setError(null);
  };

  if (analysis) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900">Resume Analysis Results</h1>
          <Button
            onClick={resetAnalysis}
            variant="secondary"
          >
            <RefreshCw size={18} className="mr-2" />
            Analyze New Resume
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
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
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS Compatibility</h2>
                  <CircularProgress 
                    value={analysis.atsScore} 
                    size={120}
                    color={analysis.atsScore >= 80 ? "#10B981" : analysis.atsScore >= 60 ? "#F59E0B" : "#EF4444"}
                  />
                  <p className="text-sm text-gray-600 mt-4">
                    {analysis.atsScore >= 80 
                      ? "Excellent ATS optimization" 
                      : analysis.atsScore >= 60 
                      ? "Good, with room for improvement"
                      : "Needs significant optimization"}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Match</h2>
                  <CircularProgress 
                    value={analysis.matchScore} 
                    size={120}
                    color={analysis.matchScore >= 80 ? "#10B981" : analysis.matchScore >= 60 ? "#F59E0B" : "#EF4444"}
                  />
                  <p className="text-sm text-gray-600 mt-4">
                    {analysis.matchScore >= 80 
                      ? "Strong match for this role" 
                      : analysis.matchScore >= 60 
                      ? "Moderate fit, improve keywords"
                      : "Low match, needs work"}
                  </p>
                </div>
              </Card>
            </div>

            {/* Candidate Info */}
            {analysis.candidateInfo && (
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Candidate Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-600">{analysis.candidateInfo.name || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-600">{analysis.candidateInfo.email || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-600">{analysis.candidateInfo.phone || 'Not found'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{analysis.candidateInfo.location || 'Not found'}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Strengths</h3>
                  <p className="text-3xl font-bold text-green-600">{analysis.strengths.length}</p>
                  <p className="text-sm text-gray-500">Areas of excellence</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Improvements</h3>
                  <p className="text-3xl font-bold text-orange-600">{analysis.weaknesses.length}</p>
                  <p className="text-sm text-gray-500">Areas to improve</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overall</h3>
                  <p className="text-3xl font-bold text-blue-600">{analysis.overallRating}</p>
                  <p className="text-sm text-gray-500">Grade rating</p>
                </div>
              </Card>
            </div>

            {/* AI Summary */}
            {analysis.summary && (
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis Summary</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {analysis.summary}
                </p>
              </Card>
            )}

            {/* Keywords Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Keywords Found ({analysis.keywordsFound.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordsFound.slice(0, 10).map((keyword: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Missing Keywords ({analysis.keywordsMissing.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordsMissing.slice(0, 10).map((keyword: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Detailed Sections */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Strengths</h3>
              <div className="space-y-3">
                {analysis.strengths.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
              <div className="space-y-3">
                {analysis.weaknesses.map((weakness: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{weakness}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={handleDownloadReport}>
                  <Download size={18} className="mr-2" />
                  Download PDF Report
                </Button>
                <Button variant="secondary" className="w-full" onClick={resetAnalysis}>
                  <RefreshCw size={18} className="mr-2" />
                  Analyze Another
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recommendation</h3>
              <div className={`p-4 rounded-lg ${
                analysis.recommendation === 'Strongly Recommend' 
                  ? 'bg-green-50 border border-green-200' 
                  : analysis.recommendation === 'Recommend'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-orange-50 border border-orange-200'
              }`}>
                <p className={`font-semibold ${
                  analysis.recommendation === 'Strongly Recommend' 
                    ? 'text-green-900' 
                    : analysis.recommendation === 'Recommend'
                    ? 'text-blue-900'
                    : 'text-orange-900'
                }`}>
                  {analysis.recommendation || 'Review Needed'}
                </p>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Practice Video Interview</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Test your interview skills with AI-powered feedback
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Start Practice →
                  </Button>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Live Interview Simulation</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Experience realistic interview scenarios
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Schedule Now →
                  </Button>
                </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
        <p className="text-gray-600 mt-2">
          Upload your resume and job description to get detailed ATS compatibility analysis powered by AI
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
          
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragOver ? 'border-black bg-gray-50' : 'border-gray-300'}
              ${selectedFile ? 'bg-green-50 border-green-300' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <CheckCircle size={48} className="text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload size={48} className="text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop your resume here
                  </p>
                  <p className="text-gray-500">or click to browse files</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Supported formats: PDF (Max 10MB)
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Job Description <span className="text-red-500">*</span>
          </h2>
          
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here to get tailored feedback...

Include:
- Required skills and qualifications
- Job responsibilities
- Experience requirements
- Preferred qualifications"
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Minimum 50 characters required
            </p>
            <p className={`text-xs ${jobDescription.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
              {jobDescription.length} characters
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={!selectedFile || jobDescription.length < 50 || isAnalyzing}
          className="px-8"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Analyzing Resume...
            </>
          ) : (
            'Analyze Resume with AI'
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <Card>
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Resume</h3>
            <p className="text-gray-600">
              Our AI is reviewing your resume for ATS compatibility, keyword optimization, and content quality...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take 10-30 seconds
            </p>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">What We Analyze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">ATS compatibility and keyword optimization</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Job description match percentage</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Skills assessment and gap analysis</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Actionable improvement recommendations</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResumeAnalysis;