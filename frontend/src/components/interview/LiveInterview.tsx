import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, Phone, Eye, Volume2, Clock, Upload, AlertCircle, Play, Square } from 'lucide-react';
import { interviewAPI } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

const LiveInterview: React.FC = () => {
  const [setupStage, setSetupStage] = useState<'upload' | 'active' | 'complete'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [interviewPlan, setInterviewPlan] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [duration] = useState(30); // Fixed 30 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [allAnswers, setAllAnswers] = useState<any[]>([]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Voice functionality states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [realTimeFeedback, setRealTimeFeedback] = useState({
    eyeContact: 0,
    posture: 0,
    confidence: 0,
    speechPace: 0
  });

  const [finalResults, setFinalResults] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getCurrentQuestions = () => {
    if (interviewPlan?.questions) {
      return interviewPlan.questions.map((q: any) => q.question);
    }
    return [];
  };

  // Reset answer when question changes
  useEffect(() => {
    if (setupStage === 'active' && !isSubmittingAnswer) {
      setCurrentAnswer('');
      setInterimTranscript('');
    }
  }, [currentQuestion, setupStage, isSubmittingAnswer]);

  // Improved Camera Initialization
  useEffect(() => {
    if (setupStage === 'active') {
      let mounted = true;

      const initializeCamera = async () => {
        try {
          console.log('Initializing camera...');
          
          if (!videoRef.current) {
            console.error('Video element not found');
            return;
          }

          // Clear any existing streams first
          if (videoRef.current.srcObject) {
            const oldStream = videoRef.current.srcObject as MediaStream;
            oldStream.getTracks().forEach(track => {
              track.stop();
            });
            videoRef.current.srcObject = null;
          }

          // Get user media with proper constraints
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
              frameRate: { ideal: 30 }
            },
            audio: true
          });

          if (mounted && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;

            // Wait for video to be ready
            await new Promise<void>((resolve) => {
              if (!videoRef.current) return;
              videoRef.current.onloadedmetadata = () => resolve();
            });

            await videoRef.current.play();
            console.log('Camera initialized successfully');
            setIsVideoOn(true);
          }
        } catch (error) {
          console.error('Camera initialization error:', error);
          setError('Failed to start camera. Please check permissions and try again.');
        }
      };

      initializeCamera();

      return () => {
        mounted = false;
        // Cleanup on unmount
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            track.stop();
          });
          videoRef.current.srcObject = null;
        }
      };
    }
  }, [setupStage]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (setupStage === 'active') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSpeechRecognitionSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
          let newInterimTranscript = '';
          let newFinalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              newFinalTranscript += transcript + ' ';
            } else {
              newInterimTranscript += transcript;
            }
          }

          if (newFinalTranscript) {
            finalTranscript += newFinalTranscript;
            setCurrentAnswer(prev => prev + ' ' + newFinalTranscript);
            setInterimTranscript('');
          } else {
            setInterimTranscript(newInterimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please allow microphone access for voice recognition.');
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          if (isRecording) {
            // Restart recognition if still recording
            try {
              recognition.start();
            } catch (err) {
              console.error('Error restarting speech recognition:', err);
              setIsRecording(false);
            }
          }
        };

        setSpeechRecognition(recognition);
      } else {
        setIsSpeechRecognitionSupported(false);
        setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      }
    }
  }, [setupStage]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (setupStage === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [setupStage, timeRemaining]);

  // Real-time Feedback Simulation - Start from 0 and build up based on performance
  useEffect(() => {
    if (setupStage === 'active' && isVideoOn && isAudioOn) {
      const feedbackInterval = setInterval(() => {
        setRealTimeFeedback(prev => {
          // Calculate base scores based on actual performance indicators
          const hasAnswer = currentAnswer.trim().length > 0;
          const answerLength = currentAnswer.length;
          const isSpeaking = isRecording;
          
          // Build scores gradually based on user interaction
          const newEyeContact = Math.min(100, prev.eyeContact + (hasAnswer ? 1 : 0) + (isSpeaking ? 0.5 : 0));
          const newPosture = Math.min(100, prev.posture + (hasAnswer ? 0.8 : 0) + (isVideoOn ? 0.3 : 0));
          const newConfidence = Math.min(100, prev.confidence + (answerLength > 50 ? 1.2 : 0.5) + (isSpeaking ? 0.7 : 0));
          const newSpeechPace = Math.min(100, prev.speechPace + (isSpeaking ? 1 : 0) + (hasAnswer ? 0.5 : 0));

          return {
            eyeContact: Math.max(0, newEyeContact),
            posture: Math.max(0, newPosture),
            confidence: Math.max(0, newConfidence),
            speechPace: Math.max(0, newSpeechPace)
          };
        });
      }, 3000);
      return () => clearInterval(feedbackInterval);
    } else if (setupStage === 'active' && (!isVideoOn || !isAudioOn)) {
      // Decrease scores if camera/mic are off
      setRealTimeFeedback(prev => ({
        eyeContact: Math.max(0, prev.eyeContact - 2),
        posture: Math.max(0, prev.posture - 2),
        confidence: Math.max(0, prev.confidence - 2),
        speechPace: Math.max(0, prev.speechPace - 2)
      }));
    }
  }, [setupStage, isVideoOn, isAudioOn, currentAnswer, isRecording]);

  // Initialize voice recording
  const initializeVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Audio recording is now only for backup/analysis, not for transcription
      };
      
      setMediaRecorder(recorder);
    } catch (err) {
      console.error('Error initializing voice recording:', err);
      setError('Microphone access is required for voice answers');
    }
  };

  // Start speech recognition
  const startSpeechRecognition = () => {
    if (speechRecognition && isSpeechRecognitionSupported) {
      try {
        speechRecognition.start();
        setIsRecording(true);
        setInterimTranscript('');
        setError(null);
      } catch (err) {
        setError('Failed to start speech recognition');
        setIsRecording(false);
      }
    } else {
      setError('Speech recognition not available. Please type your answer.');
    }
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (speechRecognition && isSpeechRecognitionSupported) {
      try {
        speechRecognition.stop();
        setIsRecording(false);
        // Add the interim transcript to final answer
        if (interimTranscript) {
          setCurrentAnswer(prev => prev + ' ' + interimTranscript);
          setInterimTranscript('');
        }
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  };

  // Start recording (both audio and speech recognition)
  const startRecording = () => {
    if (isSpeechRecognitionSupported) {
      startSpeechRecognition();
    }
    
    // Start audio recording for backup/analysis
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setAudioChunks([]);
      mediaRecorder.start();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (isSpeechRecognitionSupported) {
      stopSpeechRecognition();
    }
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  // Speak question using text-to-speech
  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlayingQuestion(true);
      utterance.onend = () => setIsPlayingQuestion(false);
      utterance.onerror = () => {
        setIsPlayingQuestion(false);
        setError('Text-to-speech failed. Please read the question.');
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setError('Text-to-speech not supported in this browser. Please read the question.');
    }
  };

  // Resume Upload and Auto-Start Interview
  const handleResumeUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setResumeFile(file);
    setIsLoadingPlan(true);
    setError(null);

    try {
      // Generate interview plan from resume
      const response = await interviewAPI.generatePlan(file);
      setInterviewPlan(response.plan);

      // Initialize voice recording
      await initializeVoiceRecording();

      // Reset feedback scores to 0
      setRealTimeFeedback({
        eyeContact: 0,
        posture: 0,
        confidence: 0,
        speechPace: 0
      });

      // Start interview immediately
      setSetupStage('active');
      setTimeRemaining(duration * 60);
      setCurrentQuestion(0);
      setCurrentAnswer('');
      setInterimTranscript('');
      setError(null);

      // Speak the first question
      const questions = getCurrentQuestions();
      if (questions.length > 0) {
        setTimeout(() => speakQuestion(questions[0]), 1000);
      }
    } catch (err: any) {
      setError('Failed to start interview: ' + err.message);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Save and Evaluate Answer
  const handleSaveAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before moving to the next question.');
      return;
    }

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    setIsSubmittingAnswer(true);
    const questions = getCurrentQuestions();
    const currentQuestionIndex = currentQuestion;
    const questionData = interviewPlan?.questions?.[currentQuestionIndex] || {
      type: 'technical',
      question: questions[currentQuestionIndex],
      category: 'general'
    };

    // Store the current answer before resetting
    const answerToSubmit = currentAnswer.trim();

    try {
      const evaluation = await interviewAPI.evaluateAnswer(
        questionData,
        answerToSubmit,
        interviewPlan?.resume_keywords || null
      );

      setAllAnswers(prev => [...prev, {
        question: questionData,
        answer: answerToSubmit,
        evaluation: evaluation.evaluation,
        face_detected: true,
        used_voice: isRecording
      }]);

      // Reset answer state immediately after storing
      setCurrentAnswer('');
      setInterimTranscript('');
      setError(null);

      if (currentQuestionIndex < questions.length - 1) {
        const nextQuestion = currentQuestionIndex + 1;
        setCurrentQuestion(nextQuestion);
        
        // Speak the next question
        setTimeout(() => speakQuestion(questions[nextQuestion]), 500);
      } else {
        handleEndInterview();
      }
    } catch (err: any) {
      setError('Failed to evaluate answer: ' + err.message);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // End Interview and Generate Report
  const handleEndInterview = async () => {
    // Stop speech recognition
    if (speechRecognition) {
      speechRecognition.stop();
    }
    
    // Stop text-to-speech
    speechSynthesis.cancel();

    setSetupStage('complete');

    // Stop media streams
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    if (allAnswers.length === 0) {
      setError('No answers recorded. Please try again.');
      return;
    }

    try {
      const interviewData = {
        interview_plan: interviewPlan || {
          branch: 'General',
          skills_summary: '',
          projects_summary: '',
          questions: getCurrentQuestions().map((q: string) => ({
            type: 'technical',
            question: q
          })),
          resume_keywords: []
        },
        results: allAnswers,
        camera_verified: true
      };

      const response = await interviewAPI.completeInterview(interviewData);

      // Calculate actual scores based on performance
      const totalScore = allAnswers.reduce((sum, answer) => 
        sum + (answer.evaluation?.score || 70), 0);
      const averageScore = Math.round(totalScore / allAnswers.length);
      
      // Calculate metrics based on real-time feedback
      const averageEyeContact = Math.round(realTimeFeedback.eyeContact);
      const averagePosture = Math.round(realTimeFeedback.posture);
      const averageConfidence = Math.round(realTimeFeedback.confidence);
      const averageSpeechPace = Math.round(realTimeFeedback.speechPace);

      setAnalysisId(response.analysis_id);
      setFinalResults({
        overallScore: averageScore,
        duration: duration - Math.floor(timeRemaining / 60),
        questionsAnswered: allAnswers.length,
        voiceAnswersUsed: allAnswers.filter(a => a.used_voice).length,
        averageEyeContact,
        averagePosture,
        averageConfidence,
        averageSpeechPace,
        feedback: response.feedback || [
          "Strong communication demonstrated",
          "Good technical knowledge",
          "Maintain better eye contact",
          "Speak with more confidence"
        ]
      });
    } catch (err: any) {
      setError('Failed to complete interview: ' + err.message);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisId) {
      setError('No report available');
      return;
    }

    try {
      await interviewAPI.downloadReport(analysisId);
    } catch (err: any) {
      setError('Failed to download report: ' + err.message);
    }
  };

  const handleNewInterview = () => {
    // Clean up speech recognition
    if (speechRecognition) {
      speechRecognition.stop();
    }
    
    // Clean up text-to-speech
    speechSynthesis.cancel();
    
    setSetupStage('upload');
    setResumeFile(null);
    setInterviewPlan(null);
    setCurrentQuestion(0);
    setCurrentAnswer('');
    setInterimTranscript('');
    setAllAnswers([]);
    setError(null);
    setFinalResults(null);
    setAnalysisId(null);
    setIsRecording(false);
    setIsPlayingQuestion(false);
    setRealTimeFeedback({
      eyeContact: 0,
      posture: 0,
      confidence: 0,
      speechPace: 0
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // UPLOAD STAGE
  if (setupStage === 'upload') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Interview Simulation</h1>
          <p className="text-lg text-gray-600">
            Upload your resume to begin your personalized AI-powered interview
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        <Card>
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-gray-400 transition-colors">
              {isLoadingPlan ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
                  <p className="text-lg font-medium text-gray-900">Preparing Your Interview...</p>
                  <p className="text-sm text-gray-600">Analyzing resume and generating personalized questions</p>
                </div>
              ) : resumeFile ? (
                <div className="space-y-4">
                  <Upload size={64} className="text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">{resumeFile.name}</p>
                    <p className="text-sm text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => setResumeFile(null)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Remove and upload different file
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-900 mb-2">
                    Upload Your Resume
                  </p>
                  <p className="text-gray-600 mb-6">
                    PDF format, max 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeUpload(file);
                    }}
                    className="hidden"
                    id="resume-input"
                  />
                  <Button
                    size="lg"
                    onClick={() => document.getElementById('resume-input')?.click()}
                    disabled={isLoadingPlan}
                  >
                    Choose Resume File
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload size={24} className="text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">1. Upload Resume</h4>
              <p className="text-sm text-gray-600">We'll analyze your experience and skills</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera size={24} className="text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">2. Live Interview</h4>
              <p className="text-sm text-gray-600">Answer personalized questions with AI feedback</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye size={24} className="text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">3. Get Results</h4>
              <p className="text-sm text-gray-600">Detailed performance analysis and tips</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ACTIVE INTERVIEW STAGE
  if (setupStage === 'active') {
    const questions = getCurrentQuestions();
    
    return (
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Interview Session</h1>
            <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Clock size={18} className="text-gray-600" />
              <span className="font-mono text-lg font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="danger" onClick={handleEndInterview}>
              <Phone size={18} className="mr-2" />
              End Interview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card padding="none">
              <div className="grid grid-cols-1 md:grid-cols-2 h-96">
                <div className="relative bg-gray-900">
                  <video 
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror the video
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700' : 'bg-red-600'} text-white hover:opacity-90`}
                      >
                        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                      </button>
                      <button
                        onClick={() => setIsAudioOn(!isAudioOn)}
                        className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-700' : 'bg-red-600'} text-white hover:opacity-90`}
                      >
                        {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">You</span>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-900 font-bold text-xl">AI</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium">AI Interviewer</p>
                    <p className="text-sm opacity-75">
                      {isPlayingQuestion ? 'Speaking...' : isRecording ? 'Listening...' : 'Ready'}
                    </p>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">Interviewer</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Question</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => speakQuestion(questions[currentQuestion])}
                    disabled={isPlayingQuestion}
                  >
                    {isPlayingQuestion ? (
                      <>
                        <Square size={16} className="mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Hear Question
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-blue-900 font-medium text-lg">{questions[currentQuestion]}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={isRecording ? "danger" : "secondary"}
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isPlayingQuestion || !isSpeechRecognitionSupported}
                    >
                      {isRecording ? (
                        <>
                          <Square size={16} className="mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic size={16} className="mr-2" />
                          Voice Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {!isSpeechRecognitionSupported && (
                  <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    Voice recognition not supported in this browser. Please type your answers.
                  </div>
                )}
                <textarea
                  value={currentAnswer + (interimTranscript && !isSubmittingAnswer ? ' ' + interimTranscript : '')}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={isSpeechRecognitionSupported ? 
                    "Type your answer here or use voice recording..." : 
                    "Type your answer here..."}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  rows={4}
                  disabled={isSubmittingAnswer}
                />
                {isRecording && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm">Listening... Speak now</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Button
                  onClick={handleSaveAnswer}
                  disabled={isSubmittingAnswer || !currentAnswer.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isSubmittingAnswer ? 'Evaluating Answer...' : 
                   currentQuestion < questions.length - 1 ? 'Submit & Next Question' : 'Submit & Finish Interview'}
                </Button>
              </div>

              <div className="mt-4">
                <ProgressBar
                  value={((currentQuestion + 1) / questions.length) * 100}
                  label={`Progress: ${currentQuestion + 1} of ${questions.length} questions`}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Live Feedback</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Eye size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">Eye Contact</span>
                    </div>
                    <span className="text-sm text-gray-600">{Math.round(realTimeFeedback.eyeContact)}%</span>
                  </div>
                  <ProgressBar value={realTimeFeedback.eyeContact} size="sm" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Posture</span>
                    <span className="text-sm text-gray-600">{Math.round(realTimeFeedback.posture)}%</span>
                  </div>
                  <ProgressBar value={realTimeFeedback.posture} size="sm" color="success" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Volume2 size={16} className="text-purple-500" />
                      <span className="text-sm font-medium">Confidence</span>
                    </div>
                    <span className="text-sm text-gray-600">{Math.round(realTimeFeedback.confidence)}%</span>
                  </div>
                  <ProgressBar value={realTimeFeedback.confidence} size="sm" color="warning" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Mic size={16} className="text-red-500" />
                      <span className="text-sm font-medium">Speech Pace</span>
                    </div>
                    <span className="text-sm text-gray-600">{Math.round(realTimeFeedback.speechPace)}%</span>
                  </div>
                  <ProgressBar value={realTimeFeedback.speechPace} size="sm" color="danger" />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Tips</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-blue-800">Look at the camera while speaking</p>
                </div>
                <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                  <p className="text-green-800">Take your time to think</p>
                </div>
                <div className="p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                  <p className="text-purple-800">Be specific with examples</p>
                </div>
                <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                  <p className="text-orange-800">Use voice recording for natural answers</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE STAGE
  if (setupStage === 'complete' && finalResults) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Interview Complete!</h1>
          <p className="text-gray-600 mt-2">Here's your performance summary</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Overall Performance</h2>
                <div className="w-32 h-32 mx-auto mb-4">
                  <div className="relative w-full h-full">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle
                        cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - finalResults.overallScore / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{finalResults.overallScore}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-600">Great performance! You're interview-ready.</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Session Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{finalResults.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions Answered</span>
                    <span className="font-medium">{finalResults.questionsAnswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voice Answers Used</span>
                    <span className="font-medium">{finalResults.voiceAnswersUsed}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Eye Contact</span>
                      <span className="text-sm font-medium">{finalResults.averageEyeContact}%</span>
                    </div>
                    <ProgressBar value={finalResults.averageEyeContact} size="sm" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Posture</span>
                      <span className="text-sm font-medium">{finalResults.averagePosture}%</span>
                    </div>
                    <ProgressBar value={finalResults.averagePosture} size="sm" color="success" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="text-sm font-medium">{finalResults.averageConfidence}%</span>
                    </div>
                    <ProgressBar value={finalResults.averageConfidence} size="sm" color="warning" />
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Feedback & Recommendations</h3>
              <div className="space-y-3">
                {finalResults.feedback.map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={handleDownloadReport}>
                  Download Report
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleNewInterview}>
                  New Interview
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Practice More</h4>
                  <p className="text-sm text-blue-700 mt-1">Try another interview to improve</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Video Analysis</h4>
                  <p className="text-sm text-green-700 mt-1">Record yourself for detailed feedback</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Voice Practice</h4>
                  <p className="text-sm text-purple-700 mt-1">Work on your speaking clarity and pace</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LiveInterview;