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
      const response = await api.patch('/auth/profile', profileForm);
      updateUser(response.data);
      toast.success(t('profile.profileUpdated'));
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('profile.profileUpdateError'));
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

    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 24) {
      toast.error(t('auth.passwordStrength.minLength') + ' & ' + t('auth.passwordStrength.maxLength'));
      return;
    }

    setLoading(true);

    try {
      await api.patch('/auth/password', {
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
      if (error.response?.status === 401) {
        toast.error(t('profile.invalidCurrentPassword'));
      } else {
        toast.error(error.response?.data?.message || t('profile.passwordUpdateError'));
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
        <p className="text-gray-600">{t('profile.personalInfo')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-4 font-medium transition-all ${
            activeTab === 'info'
              ? 'border-b-2 border-pink-600 text-pink-600'
              : 'text-gray-600 hover:text-pink-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('profile.accountInfo')}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 px-4 font-medium transition-all ${
            activeTab === 'password'
              ? 'border-b-2 border-pink-600 text-pink-600'
              : 'text-gray-600 hover:text-pink-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('profile.security')}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {activeTab === 'info' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('profile.personalInfo')}</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('profile.editProfile')}
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50"
                  >
                    {loading ? t('common.loading') : t('profile.updateProfile')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile.changePassword')}</h2>
              <p className="text-sm text-gray-600">{t('profile.security')}</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    maxLength={24}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                <div className="mt-2">
                  <PasswordStrength password={passwordForm.newPassword} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    maxLength={24}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('auth.passwordMismatch')}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50"
                >
                  {loading ? t('common.loading') : t('profile.updatePassword')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
