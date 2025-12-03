import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const navigationIcons = {
    Dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    Appointments: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    Clients: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    Services: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    Staff: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Manage: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    'Messages Management': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    'System Status': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    More: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  };

  const navigation = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Appointments', path: '/admin/appointments' },
    { name: 'Clients', path: '/admin/clients' },
    { name: 'Services', path: '/admin/services' },
    { name: 'Staff', path: '/admin/staff' },
  ];

  const manageSubmenu = [
    { name: 'Messages Management', path: '/admin/messages-management' },
    { name: 'System Status', path: '/admin/system-status' },
    { name: 'More', path: '/admin/more' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="relative flex items-center justify-center h-20 bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500 text-white shadow-md">
            <Link to="/admin" className="flex items-center gap-3" onClick={closeSidebar}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5">
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              </div>
              <span className="text-xl font-bold tracking-tight">Admin Panel</span>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={closeSidebar}
              className="absolute right-4 lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/30 scale-[1.02]'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-600'
                }`}
              >
                <div className={`${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} transition-colors`}>
                  {navigationIcons[item.name as keyof typeof navigationIcons]}
                </div>
                <span className="font-medium">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            ))}

            {/* Manage Menu with Submenu */}
            <div>
              <button
                onClick={() => setIsManageMenuOpen(!isManageMenuOpen)}
                className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  manageSubmenu.some(item => isActive(item.path))
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/30 scale-[1.02]'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-600'
                }`}
              >
                <div className={`${manageSubmenu.some(item => isActive(item.path)) ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} transition-colors`}>
                  {navigationIcons['Manage']}
                </div>
                <span className="font-medium flex-1 text-left">Manage</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isManageMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Submenu */}
              <div className={`overflow-hidden transition-all duration-300 ${isManageMenuOpen ? 'max-h-96 mt-1' : 'max-h-0'}`}>
                <div className="ml-8 space-y-1 border-l-2 border-gray-200 pl-3">
                  {manageSubmenu.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-600'
                      }`}
                    >
                      <div className={`${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} transition-colors`}>
                        {navigationIcons[item.name as keyof typeof navigationIcons]}
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {isActive(item.path) && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
            <Link
              to="/"
              onClick={closeSidebar}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:text-primary-600 rounded-xl transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Back to Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="h-16 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
                {navigation.find((item) => isActive(item.path))?.name ||
                 manageSubmenu.find((item) => isActive(item.path))?.name ||
                 'Dashboard'}
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
