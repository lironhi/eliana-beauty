import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { PasswordStrength } from '@/components/PasswordStrength';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Load user statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load bookings count
        const appointments = await api.getMyAppointments();
        setBookingsCount(appointments.length);

        // Load messages count
        const inbox = await api.getInbox();
        const totalMessages = (inbox.direct?.length || 0) + (inbox.broadcasts?.length || 0);
        setMessagesCount(totalMessages);
      } catch (error) {
        console.error('Failed to load user stats:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await api.updateProfile(profileForm);
      updateUser(updatedUser);
      toast.success(t('profile.profileUpdated'));
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || t('profile.profileUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 24) {
      toast.error(t('auth.passwordStrength.minLength') + ' & ' + t('auth.passwordStrength.maxLength'));
      return;
    }

    setLoading(true);

    try {
      await api.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(t('profile.passwordUpdated'));
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error: any) {
      if (error.message?.includes('incorrect')) {
        toast.error(t('profile.invalidCurrentPassword'));
      } else {
        toast.error(error.message || t('profile.passwordUpdateError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
            Admin
          </span>
        );
      case 'STAFF':
        return (
          <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
            Staff
          </span>
        );
      default:
        return (
          <span className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg">
            Client
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Avatar */}
        <div className="mb-8 bg-white rounded-3xl shadow-xl p-8 border-2 border-pink-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-2xl ring-4 ring-white">
                {user?.name ? getInitials(user.name) : '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {user?.name || t('profile.title')}
                </h1>
                {user?.role && getRoleBadge(user.role)}
              </div>
              <p className="text-gray-600 text-lg mb-1">{user?.email}</p>
              <p className="text-gray-500">{user?.phone}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-2xl font-bold text-pink-600">{bookingsCount}</div>
                </div>
                <div className="text-xs text-gray-600 font-semibold">Bookings</div>
              </div>
              <div className="text-center px-6 py-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="text-2xl font-bold text-purple-600">{messagesCount}</div>
                </div>
                <div className="text-xs text-gray-600 font-semibold">Messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('profile.accountInfo')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('profile.security')}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-pink-100">
        {activeTab === 'info' ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {t('profile.personalInfo')}
                </h2>
                <p className="text-sm text-gray-500">Manage your account details</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('profile.editProfile')}
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('auth.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 transition-all outline-none disabled:bg-white disabled:text-gray-700 bg-white shadow-sm"
                />
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all outline-none disabled:bg-white disabled:text-gray-700 bg-white shadow-sm"
                />
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none disabled:bg-white disabled:text-gray-700 bg-white shadow-sm"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('profile.updateProfile')}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {t('profile.changePassword')}
              </h2>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">Security Tip</p>
                  <p className="text-sm text-amber-800">
                    Use a strong password with at least 6 characters, including uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('profile.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 pr-12 border-2 border-red-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all outline-none bg-white shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t('profile.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    maxLength={24}
                    className="w-full px-4 py-3 pr-12 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all outline-none bg-white shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-3">
                  <PasswordStrength password={passwordForm.newPassword} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('profile.confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    maxLength={24}
                    className="w-full px-4 py-3 pr-12 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all outline-none bg-white shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword && (
                  <div className="mt-3 bg-red-100 border-2 border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('auth.passwordMismatch')}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {t('profile.updatePassword')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
