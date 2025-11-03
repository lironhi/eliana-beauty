import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n';
import MobileBottomNav from './MobileBottomNav';

export default function Layout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguageChange = (newLocale: 'en' | 'he') => {
    setLocale(newLocale);
    setIsLanguageOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'he', flag: '🇮🇱', name: 'עברית' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-pink-100/50 sticky top-0 z-40">
        {/* Decorative gradient line */}
        <div className="h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400"></div>

        <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo with glow effect */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <img
              src="/logo.svg"
              alt="Eliana Beauty"
              className="h-8 md:h-10 w-auto relative z-10 transform transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            {/* User Greeting - Enhanced with icon and gradient */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-xl border border-pink-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  <span className="text-pink-600 font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {user.name?.split(' ')[0] || user.email.split('@')[0]}
                  </span>
                </span>
              </div>
            )}

            {/* Language Selector - Enhanced design */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-lg bg-white shadow-md border-2 border-pink-100 group-hover:scale-110 transition-transform duration-300">
                  {currentLanguage.flag}
                </div>
                <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-all duration-300 ${isLanguageOpen ? 'rotate-180 text-pink-600' : 'group-hover:text-pink-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu - Enhanced */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-pink-100 py-2 z-50 animate-scale-in overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400"></div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'en' | 'he')}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 ${
                        locale === lang.code ? 'bg-gradient-to-r from-pink-50 to-purple-50' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xl bg-white shadow-lg border-2 border-pink-100">
                        {lang.flag}
                      </div>
                      <span className={`text-sm font-semibold ${locale === lang.code ? 'text-pink-600' : 'text-gray-700'}`}>
                        {lang.name}
                      </span>
                      {locale === lang.code && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <Link to="/services" className="hidden sm:block text-sm lg:text-base text-gray-700 hover:text-primary-600">
              {t('nav.services')}
            </Link>

            {isAuthenticated ? (
              <>
                {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-2 px-2 lg:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs lg:text-sm font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>
                )}
                <Link to="/bookings" className="hidden md:block text-sm lg:text-base text-gray-700 hover:text-primary-600">
                  {t('nav.myBookings')}
                </Link>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">{t('nav.myProfile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm lg:text-base text-gray-700 hover:text-red-600"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-xs sm:text-sm lg:text-base text-gray-700 hover:text-primary-600">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="hidden sm:block btn-primary text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/logo.svg"
                alt="Eliana Beauty"
                className="h-8 md:h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </Link>
            <p className="text-center text-gray-600 text-sm">
              © {new Date().getFullYear()} Eliana Beauty. {t('common.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
