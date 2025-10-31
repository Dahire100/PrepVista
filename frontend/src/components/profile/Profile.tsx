import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Edit3, Camera, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authAPI, analysisAPI } from '../../services/api';

interface ProfileProps {
  onProfileUpdate?: (user: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    university: '',
    course: '',
    graduationYear: '',
    bio: '',
    profilePhoto: '',
    skills: [] as string[],
    experience: [] as any[],
    achievements: [] as string[],
    subscription: {
      plan: 'free',
      analyses_used: 0,
      analyses_limit: 5
    }
  });

  const [stats, setStats] = useState({
    resumeScore: 0,
    practiceSessions: 0,
    successRate: 0,
    memberSince: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user } = await authAPI.getCurrentUser();
      
      setProfileData({
        name: user.full_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        linkedin: user.profile?.linkedin || '',
        location: user.profile?.location || '',
        university: user.profile?.university || '',
        course: user.profile?.course || '',
        graduationYear: user.profile?.graduation_year || '',
        bio: user.profile?.bio || '',
        profilePhoto: user.profile?.profile_photo || '',
        skills: user.profile?.skills || [],
        experience: user.profile?.experience || [],
        achievements: user.profile?.achievements || [],
        subscription: user.subscription || {
          plan: 'free',
          analyses_used: 0,
          analyses_limit: 5
        }
      });
      
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await analysisAPI.getStats();
      const history = await analysisAPI.getAnalysisHistory();
      
      const successfulAnalyses = history.filter((item: any) => 
        (item.overall_score || item.results?.overall_score || 0) >= 70
      );
      const successRate = history.length > 0 
        ? Math.round((successfulAnalyses.length / history.length) * 100)
        : 0;
      
      const oldestAnalysis = history.length > 0 
        ? new Date(history[history.length - 1].created_at)
        : new Date();
      
      setStats({
        resumeScore: Math.round(statsData.average_resume_score || 0),
        practiceSessions: statsData.total_analyses || 0,
        successRate: successRate,
        memberSince: oldestAnalysis.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        })
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    setError(null);

    try {
      // Upload photo to server
      const result = await authAPI.uploadProfilePhoto(file);
      
      // Update local state with new photo URL
      setProfileData(prev => ({ 
        ...prev, 
        profilePhoto: result.photo_url 
      }));
      
      setSuccessMessage('Profile photo updated successfully!');
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(result.user);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSkillsChange = (skills: string) => {
    setProfileData(prev => ({ 
      ...prev, 
      skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill) 
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updateData = {
        full_name: profileData.name,
        profile: {
          phone: profileData.phone,
          linkedin: profileData.linkedin,
          location: profileData.location,
          university: profileData.university,
          course: profileData.course,
          graduation_year: profileData.graduationYear,
          bio: profileData.bio,
          skills: profileData.skills,
          experience: profileData.experience,
          achievements: profileData.achievements
        }
      };
      
      const result = await authAPI.updateProfile(updateData);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      if (onProfileUpdate) {
        onProfileUpdate(result.user);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addExperience = () => {
    setProfileData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          duration: '',
          description: ''
        }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setProfileData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  };

  const removeExperience = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    const achievement = prompt('Enter achievement:');
    if (achievement && achievement.trim()) {
      setProfileData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievement.trim()]
      }));
    }
  };

  const removeAchievement = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save size={18} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={18} className="mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <div className="flex-1">
            <p className="text-green-800">{successMessage}</p>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle size={20} className="text-red-600 mr-3 flex-shrink-0 mt-0.5" />
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
        <div className="space-y-6">
          <Card>
            <div className="text-center">
              <div className="relative inline-block">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden ${
                    isUploadingPhoto ? 'opacity-50' : ''
                  } ${
                    !isUploadingPhoto ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                  }`}
                  onClick={!isUploadingPhoto ? handlePhotoClick : undefined}
                >
                  {profileData.profilePhoto ? (
                    <img 
                      src={profileData.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <User size={32} className="text-gray-600" />
                    </div>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
                <button 
                  onClick={handlePhotoClick}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload profile picture"
                  type="button"
                >
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{profileData.name || 'Your Name'}</h2>
              <p className="text-gray-600">{profileData.course || 'Your Course'}</p>
              <p className="text-gray-500 text-sm">{profileData.university || 'Your University'}</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Resume Score</span>
                <span className="font-medium">{stats.resumeScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Practice Sessions</span>
                <span className="font-medium">{stats.practiceSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">{stats.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">{stats.memberSince}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Subscription</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium capitalize">{profileData.subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analyses Used</span>
                <span className="font-medium">
                  {profileData.subscription.analyses_used} / {profileData.subscription.analyses_limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(profileData.subscription.analyses_used / profileData.subscription.analyses_limit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </Card>

          {profileData.achievements.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {profileData.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{achievement}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  disabled={true}
                  title="Email cannot be changed"
                />
              </div>
              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Input
                  label="LinkedIn Profile"
                  value={profileData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <Input
                  label="University"
                  value={profileData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Stanford University"
                />
              </div>
              <div>
                <Input
                  label="Course/Major"
                  value={profileData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Input
                  label="Graduation Year"
                  value={profileData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  disabled={!isEditing}
                  placeholder="2024"
                />
              </div>
              <div>
                <Input
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bio</h3>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              rows={4}
              className={`w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-transparent ${
                !isEditing ? 'bg-gray-50' : ''
              }`}
              placeholder="Tell us about yourself, your interests, and career goals..."
            />
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
            {isEditing ? (
              <div>
                <Input
                  label="Skills (comma-separated)"
                  value={profileData.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  placeholder="JavaScript, React, Node.js, Python..."
                />
              </div>
            ) : (
              <div>
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Experience</h3>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={addExperience}>
                  Add Experience
                </Button>
              )}
            </div>
            {profileData.experience.length > 0 ? (
              <div className="space-y-6">
                {profileData.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          label="Job Title"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          placeholder="Software Engineering Intern"
                        />
                        <Input
                          label="Company"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="Tech Startup Inc."
                        />
                        <Input
                          label="Duration"
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                          placeholder="Summer 2023"
                        />
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Description of your role and achievements..."
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{exp.title}</h4>
                            <p className="text-gray-600">{exp.company}</p>
                          </div>
                          <span className="text-sm text-gray-500">{exp.duration}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{exp.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No experience added yet</p>
            )}
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Achievements</h3>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={addAchievement}>
                  Add Achievement
                </Button>
              )}
            </div>
            {profileData.achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 flex-1">{achievement}</p>
                    {isEditing && (
                      <button
                        onClick={() => removeAchievement(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No achievements added yet</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;