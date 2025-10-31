import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Moon, 
  Sun,
  Globe,
  Camera,
  Mic,
  Volume2,
  LogOut,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { authAPI, User as UserType } from '../../services/api';

interface SettingsProps {
  onLogout?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    // Account settings
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    university: '',
    course: '',
    graduation_year: '',
    bio: '',
    skills: [] as string[],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notification settings
    emailNotifications: true,
    practiceReminders: true,
    weeklyReports: true,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    
    // Appearance settings
    theme: 'light',
    language: 'en',
    
    // Device settings
    cameraPermission: true,
    microphonePermission: true,
    autoRecord: false
  });

  useEffect(() => {
    loadUserData();
    loadLocalPreferences();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      setUser(response.user);
      
      // Set profile photo preview if exists
      if (response.user.profile?.profile_photo) {
        setProfilePhotoPreview(response.user.profile.profile_photo);
      }
      
      // Populate settings with user data
      setSettings(prev => ({
        ...prev,
        name: response.user.full_name || '',
        email: response.user.email || '',
        phone: response.user.profile?.phone || '',
        linkedin: response.user.profile?.linkedin || '',
        location: response.user.profile?.location || '',
        university: response.user.profile?.university || '',
        course: response.user.profile?.course || '',
        graduation_year: response.user.profile?.graduation_year || '',
        bio: response.user.profile?.bio || '',
        skills: response.user.profile?.skills || []
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      showMessage('error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadLocalPreferences = () => {
    const prefs = localStorage.getItem('userPreferences');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  };

  const saveLocalPreferences = () => {
    const prefs = {
      emailNotifications: settings.emailNotifications,
      practiceReminders: settings.practiceReminders,
      weeklyReports: settings.weeklyReports,
      marketingEmails: settings.marketingEmails,
      profileVisibility: settings.profileVisibility,
      dataSharing: settings.dataSharing,
      analyticsTracking: settings.analyticsTracking,
      theme: settings.theme,
      language: settings.language,
      cameraPermission: settings.cameraPermission,
      microphonePermission: settings.microphonePermission,
      autoRecord: settings.autoRecord
    };
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Invalid file type. Please upload PNG, JPG, GIF, or WebP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File too large. Maximum size is 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handlePhotoUpload(file);
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const response = await authAPI.uploadProfilePhoto(file);
      setUser(response.user);
      setProfilePhotoPreview(response.photo_url);
      showMessage('success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      showMessage('error', error.message || 'Failed to upload photo');
      // Revert preview on error
      if (user?.profile?.profile_photo) {
        setProfilePhotoPreview(user.profile.profile_photo);
      } else {
        setProfilePhotoPreview(null);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setSaving(true);
      const profileData = {
        profile: {
          ...user?.profile,
          profile_photo: ''
        }
      };
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      setProfilePhotoPreview(null);
      showMessage('success', 'Profile photo removed');
    } catch (error: any) {
      console.error('Error removing photo:', error);
      showMessage('error', error.message || 'Failed to remove photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const profileData = {
        full_name: settings.name,
        profile: {
          phone: settings.phone,
          linkedin: settings.linkedin,
          location: settings.location,
          university: settings.university,
          course: settings.course,
          graduation_year: settings.graduation_year,
          bio: settings.bio,
          skills: settings.skills,
          profile_photo: user?.profile?.profile_photo || '',
          experience: user?.profile?.experience || [],
          achievements: user?.profile?.achievements || []
        }
      };

      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      
      saveLocalPreferences();
      
      showMessage('success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (settings.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    if (!settings.currentPassword) {
      showMessage('error', 'Please enter your current password');
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword(settings.currentPassword, settings.newPassword);
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      showMessage('success', 'Password changed successfully!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      await authAPI.exportData();
      showMessage('success', 'Data export started. Check your downloads.');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      showMessage('error', error.message || 'Failed to export data');
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all your practice data? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await authAPI.clearData();
      showMessage('success', 'All practice data cleared successfully');
    } catch (error: any) {
      console.error('Error clearing data:', error);
      showMessage('error', error.message || 'Failed to clear data');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt('Enter your password to confirm account deletion:');
    if (!password) return;

    if (!window.confirm('Are you ABSOLUTELY sure? This will permanently delete your account and all data. This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await authAPI.deleteAccount(password);
      showMessage('success', 'Account deleted successfully');
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showMessage('error', error.message || 'Failed to delete account');
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'devices', label: 'Devices', icon: Camera }
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profilePhotoPreview ? (
              <img 
                src={profilePhotoPreview} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Upload size={16} className="mr-2" />
                Upload Photo
              </Button>
              {profilePhotoPreview && (
                <Button
                  variant="danger"
                  onClick={handleRemovePhoto}
                  disabled={uploadingPhoto || saving}
                >
                  <X size={16} className="mr-2" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG, GIF or WebP. Max size 5MB.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={settings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingChange('email', e.target.value)}
            disabled
          />
          <Input
            label="Phone"
            value={settings.phone}
            onChange={(e) => handleSettingChange('phone', e.target.value)}
            placeholder="+1 234 567 8900"
          />
          <Input
            label="LinkedIn Profile"
            value={settings.linkedin}
            onChange={(e) => handleSettingChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
          <Input
            label="Location"
            value={settings.location}
            onChange={(e) => handleSettingChange('location', e.target.value)}
            placeholder="City, Country"
          />
          <Input
            label="University"
            value={settings.university}
            onChange={(e) => handleSettingChange('university', e.target.value)}
          />
          <Input
            label="Course"
            value={settings.course}
            onChange={(e) => handleSettingChange('course', e.target.value)}
          />
          <Input
            label="Graduation Year"
            value={settings.graduation_year}
            onChange={(e) => handleSettingChange('graduation_year', e.target.value)}
            placeholder="2024"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={settings.bio}
              onChange={(e) => handleSettingChange('bio', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={settings.currentPassword}
            onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={settings.newPassword}
            onChange={(e) => handleSettingChange('newPassword', e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={settings.confirmPassword}
            onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
          />
          <Button onClick={handleChangePassword} disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-600">Download all your data and reports</p>
            </div>
            <Button variant="secondary" onClick={handleExportData}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
          {onLogout && (
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Logout</h4>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <Button variant="secondary" onClick={onLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div>
              <h4 className="font-medium text-orange-900">Clear All Practice Data</h4>
              <p className="text-sm text-orange-600">Delete all analysis history (keeps account)</p>
            </div>
            <Button variant="danger" onClick={handleClearData}>
              <Trash2 size={16} className="mr-2" />
              Clear Data
            </Button>
          </div>
          <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive general notifications via email' },
            { key: 'practiceReminders', label: 'Practice Reminders', desc: 'Get reminded to practice regularly' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly progress summaries' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive updates about new features and tips' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Control who can see your profile</p>
            </div>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          {[
            { key: 'dataSharing', label: 'Data Sharing', desc: 'Allow anonymous data sharing for research' },
            { key: 'analyticsTracking', label: 'Analytics Tracking', desc: 'Help improve the platform with usage analytics' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: SettingsIcon }
          ].map((theme) => {
            const Icon = theme.icon;
            return (
              <label key={theme.value} className="relative">
                <input
                  type="radio"
                  name="theme"
                  value={theme.value}
                  checked={settings.theme === theme.value}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  settings.theme === theme.value 
                    ? 'border-black bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex flex-col items-center space-y-2">
                    <Icon size={24} />
                    <span className="font-medium">{theme.label}</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe size={20} className="text-gray-500" />
              <div>
                <h4 className="font-medium text-gray-900">Language</h4>
                <p className="text-sm text-gray-600">Choose your preferred language</p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDeviceSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera & Microphone</h3>
        <div className="space-y-4">
          {[
            { key: 'cameraPermission', label: 'Camera Access', desc: 'Allow access to camera for video recording', icon: Camera },
            { key: 'microphonePermission', label: 'Microphone Access', desc: 'Allow access to microphone for audio recording', icon: Mic },
            { key: 'autoRecord', label: 'Auto-Record', desc: 'Automatically start recording during practice sessions', icon: Volume2 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon size={20} className="text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'devices':
        return renderDeviceSettings();
      default:
        return renderAccountSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {renderContent()}
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={loadUserData}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;