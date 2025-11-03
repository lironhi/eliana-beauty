import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    {
      path: '/',
      label: t('nav.home'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: '/services',
      label: t('nav.services'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      highlight: true,
    },
  ];

  return (
    <>
      {/* Spacer for content above fixed nav */}
      <div className="h-20 md:hidden" />

      {/* Account Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 md:hidden z-40" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>
      )}

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-20 left-0 right-0 mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 md:hidden z-50 animate-scale-in overflow-hidden w-[240px]"
        >
          <div className="py-2">
            {user ? (
              <>
                {/* User greeting */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
                  <p className="text-xs text-gray-600 mb-1">{t('nav.account')}</p>
                  <p className="font-semibold text-gray-900 truncate">{user.name || user.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors ${
                    isActive('/profile') ? 'bg-pink-50 text-pink-600' : 'text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{t('nav.myProfile')}</span>
                </Link>

                <Link
                  to="/bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors ${
                    isActive('/bookings') ? 'bg-pink-50 text-pink-600' : 'text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="font-medium">{t('nav.myBookings')}</span>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">{t('nav.login')}</span>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors text-pink-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium">{t('nav.register')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl md:hidden z-50 animate-slide-up">
        <div className="grid grid-cols-3 gap-0 px-4 py-2 max-w-md mx-auto">
          {navItems.map((item, index) => {
            const active = isActive(item.path);

            if (item.highlight) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Highlight Button with Bounce Animation */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      {/* Pulse Ring */}
                      <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-ping opacity-20"></div>
                      {/* Main Button */}
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-pink-600 shadow-2xl flex items-center justify-center text-white transform transition-all duration-300 hover:scale-110 hover:rotate-12 group-active:scale-95">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent"></div>
                        <div className="relative animate-bounce-slow">
                          {item.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mt-8 animate-fade-in">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  active
                    ? 'text-pink-600 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                    : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`transition-all duration-300 ${active ? 'scale-110 animate-bounce-once' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-all duration-300 ${active ? 'scale-105' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-pink-600 animate-pulse"></div>
                      <div className="w-1 h-1 rounded-full bg-pink-600 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 rounded-full bg-pink-600 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {/* Account Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isMenuOpen || isActive('/profile') || isActive('/bookings')
                ? 'text-pink-600 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50/50'
            }`}
          >
            <div className={`transition-all duration-300 ${isMenuOpen ? 'scale-110' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className={`text-[10px] font-semibold mt-1 transition-all duration-300 ${isMenuOpen ? 'scale-105' : ''}`}>
              {t('nav.account')}
            </span>
            {(isMenuOpen || isActive('/profile') || isActive('/bookings')) && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-pink-600 animate-pulse"></div>
                  <div className="w-1 h-1 rounded-full bg-pink-600 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 rounded-full bg-pink-600 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Safe Area for iOS */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>
    </>
  );
}
