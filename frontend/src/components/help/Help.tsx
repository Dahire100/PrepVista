import React, { useState } from 'react';
import { HelpCircle, Search, Book, Video, MessageCircle, Mail, ChevronDown, ChevronRight, ExternalLink }
from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'resume-analysis', name: 'Resume Analysis', icon: HelpCircle },
    { id: 'video-practice', name: 'Video Practice', icon: Video },
    { id: 'live-interview', name: 'Live Interview', icon: MessageCircle },
    { id: 'reports', name: 'Reports & Analytics', icon: Book },
    { id: 'account', name: 'Account & Billing', icon: HelpCircle }
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I get started with PrepVista?',
        answer: 'Welcome to PrepVista! Start by completing your profile, then upload your resume for analysis. After that, you can practice with video interviews or jump into live interview simulations.'
      },
      {
        question: 'What features are available for free?',
        answer: 'All PrepVista features are completely free! This includes resume analysis, video practice, live interview simulations, detailed reports, and access to our question library.'
      },
      {
        question: 'How accurate is the AI feedback?',
        answer: 'Our AI is trained on thousands of successful interviews and provides feedback based on industry best practices. While it\'s highly accurate, we recommend using it as a guide alongside human feedback.'
      }
    ],
    'resume-analysis': [
      {
        question: 'What file formats are supported for resume upload?',
        answer: 'We currently support PDF files up to 10MB in size. Make sure your resume is clearly formatted and readable for the best analysis results.'
      },
      {
        question: 'How is the ATS score calculated?',
        answer: 'The ATS score is based on factors like keyword optimization, formatting, structure, and readability. We analyze how well your resume would perform with Applicant Tracking Systems.'
      },
      {
        question: 'Can I analyze my resume multiple times?',
        answer: 'Yes! You can upload and analyze your resume as many times as you want. This is helpful for tracking improvements after making changes.'
      }
    ],
    'video-practice': [
      {
        question: 'What does the video analysis include?',
        answer: 'Our video analysis covers eye contact percentage, posture scoring, gesture analysis, emotional analysis, speech quality, and overall confidence levels.'
      },
      {
        question: 'Can I upload pre-recorded videos?',
        answer: 'Yes, you can either record directly in the platform or upload existing video files for analysis. We support most common video formats.'
      },
      {
        question: 'How long should my practice videos be?',
        answer: 'We recommend 2-5 minute responses for most questions. This gives enough content for meaningful analysis while keeping sessions manageable.'
      }
    ],
    'live-interview': [
      {
        question: 'How does the live interview simulation work?',
        answer: 'The live interview feature provides real-time questions with an AI interviewer. You\'ll receive immediate feedback on your performance including posture, eye contact, and speech patterns.'
      },
      {
        question: 'Can I pause during a live interview?',
        answer: 'Yes, you can pause or end the interview at any time. However, for the most realistic practice, we recommend completing full sessions when possible.'
      },
      {
        question: 'What types of interviews are available?',
        answer: 'We offer HR/General, Technical, and Behavioral interview types. Each type focuses on different question categories and evaluation criteria.'
      }
    ],
    'reports': [
      {
        question: 'How often are reports updated?',
        answer: 'Reports are updated in real-time as you complete practice sessions. You can view your progress and analytics immediately after each session.'
      },
      {
        question: 'Can I export my reports?',
        answer: 'Yes, you can download detailed PDF reports of your performance, including scores, feedback, and improvement recommendations.'
      },
      {
        question: 'How far back does the analytics data go?',
        answer: 'We store all your practice data from when you first started using PrepVista. You can view historical trends and track long-term improvement.'
      }
    ],
    'account': [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to the Profile section in the sidebar menu. Click "Edit Profile" to update your personal information, skills, and experience.'
      },
      {
        question: 'Is my data secure and private?',
        answer: 'Yes, we take data security seriously. All your information is encrypted and stored securely. You can control your privacy settings in the Settings section.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'You can delete your account from the Settings page under Account Actions. This will permanently remove all your data and cannot be undone.'
      }
    ]
  };

  const tutorials = [
    {
      title: 'Getting Started with PrepVista',
      description: 'Complete walkthrough of all features',
      duration: '5 min',
      type: 'video'
    },
    {
      title: 'Resume Analysis Deep Dive',
      description: 'How to get the best ATS scores',
      duration: '3 min',
      type: 'video'
    },
    {
      title: 'Video Interview Best Practices',
      description: 'Tips for better video performance',
      duration: '4 min',
      type: 'article'
    },
    {
      title: 'Understanding Your Reports',
      description: 'Make sense of your analytics',
      duration: '2 min',
      type: 'article'
    }
  ];

  const filteredFaqs = faqs[activeCategory as keyof typeof faqs]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">
          Find answers to common questions and get help with PrepVista
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search for help articles, FAQs, or tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="text-center">
              <MessageCircle size={32} className="text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get instant help from our support team
              </p>
              <Button variant="secondary" size="sm">
                Start Chat
              </Button>
            </Card>

            <Card hover className="text-center">
              <Mail size={32} className="text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send us a detailed message
              </p>
              <Button variant="secondary" size="sm">
                Send Email
              </Button>
            </Card>

            <Card hover className="text-center">
              <Video size={32} className="text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-4">
                Watch step-by-step guides
              </p>
              <Button variant="secondary" size="sm">
                Watch Now
              </Button>
            </Card>
          </div>

          {/* Tutorials */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {tutorial.type === 'video' ? (
                      <Video size={18} className="text-blue-600" />
                    ) : (
                      <Book size={18} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{tutorial.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{tutorial.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{tutorial.duration}</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* FAQs */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or browse different categories.
                </p>
              </div>
            )}
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Still Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Get detailed help via email
                  </p>
                  <a href="mailto:support@prepvista.com" className="text-blue-600 hover:underline text-sm">
                    support@prepvista.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Available Monday-Friday, 9AM-6PM PST
                  </p>
                  <Button variant="ghost" size="sm">
                    Start Chat →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;