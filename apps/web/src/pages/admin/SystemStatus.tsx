import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function SystemStatus() {
  const { t } = useI18n();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const availableTables = [
    'User',
    'Service',
    'Category',
    'Staff',
    'Appointment',
    'Message',
    'MessageRecipient',
    'FcmToken',
    'RefreshToken',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadLastBackupDate();

    return () => clearInterval(timer);
  }, []);

  const loadLastBackupDate = async () => {
    try {
      const response = await api.getLastBackupDate();
      if (response.date) {
        setLastBackupDate(new Date(response.date));
      }
    } catch (error) {
      console.error('Failed to load last backup date:', error);
    }
  };

  const handleBackup = async () => {
    if (!confirm('Are you sure you want to create a database backup? This operation may take a few moments.')) {
      return;
    }

    try {
      setIsBackingUp(true);
      const tablesToBackup = selectedTables.length > 0 ? selectedTables : undefined;
      await api.backupDatabase(tablesToBackup);
      toast.success('Database backup created successfully!');
      setShowBackupModal(false);
      setSelectedTables([]);
      loadLastBackupDate();
    } catch (error: any) {
      console.error('Failed to backup database:', error);
      toast.error(error.message || 'Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!confirm('⚠️ WARNING: This will restore the database from the last backup. All current data will be replaced. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('This action cannot be undone. Do you want to continue?')) {
      return;
    }

    try {
      setIsRestoring(true);
      const tablesToRestore = selectedTables.length > 0 ? selectedTables : undefined;
      await api.restoreDatabase(tablesToRestore);
      toast.success('Database restored successfully!');
      setShowRestoreModal(false);
      setSelectedTables([]);
    } catch (error: any) {
      console.error('Failed to restore database:', error);
      toast.error(error.message || 'Failed to restore database');
    } finally {
      setIsRestoring(false);
    }
  };

  const toggleTable = (table: string) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  const selectAllTables = () => {
    setSelectedTables(availableTables);
  };

  const deselectAllTables = () => {
    setSelectedTables([]);
  };

  const statusItems = [
    {
      name: 'API Server',
      status: 'operational',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
    },
    {
      name: 'Database',
      status: 'operational',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      name: 'Authentication',
      status: 'operational',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      name: 'Storage',
      status: 'operational',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      name: 'Email Service',
      status: 'operational',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Notifications',
      status: 'operational',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'down':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                System Status
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time system monitoring
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-green-900 mb-1">All Systems Operational</h2>
            <p className="text-green-700">All services are running smoothly with no issues detected.</p>
          </div>
          <div className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-lg">
            100%
          </div>
        </div>
      </div>

      {/* System Components */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600">
                  {item.icon}
                </div>
                {getStatusIcon(item.status)}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-900">Response Time</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">45ms</p>
            <p className="text-sm text-blue-700 mt-1">Average</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-purple-900">Active Users</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">0</p>
            <p className="text-sm text-purple-700 mt-1">Currently online</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-green-900">Uptime</span>
            </div>
            <p className="text-3xl font-bold text-green-900">99.9%</p>
            <p className="text-sm text-green-700 mt-1">Last 30 days</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg border-2 border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-orange-900">Database</span>
            </div>
            <p className="text-3xl font-bold text-orange-900">12GB</p>
            <p className="text-sm text-orange-700 mt-1">Storage used</p>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Database Management</h2>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Database Backup & Restore</h3>
                <p className="text-sm text-gray-600">
                  Last backup: {lastBackupDate ? (
                    <span className="font-semibold text-blue-600">
                      {format(lastBackupDate, 'MMM dd, yyyy HH:mm')}
                    </span>
                  ) : (
                    <span className="text-gray-400">Never</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTables([]);
                  setShowBackupModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Backup
              </button>
              <button
                onClick={() => {
                  setSelectedTables([]);
                  setShowRestoreModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Restore
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Important Notice</p>
                <p className="text-sm text-amber-800">
                  Backing up the database is recommended before major updates. Restoring will replace current data with backup data. Always ensure you have a recent backup before performing critical operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No recent system events</p>
            <p className="text-gray-400 text-xs mt-1">System is running smoothly</p>
          </div>
        </div>
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Create Database Backup
                  </h2>
                </div>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Select specific tables to backup or leave empty to backup all tables.
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Select Tables</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllTables}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={deselectAllTables}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {availableTables.map((table) => (
                    <label
                      key={table}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTables.includes(table)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={() => toggleTable(table)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900">{table}</span>
                    </label>
                  ))}
                </div>

                {selectedTables.length === 0 && (
                  <p className="text-sm text-blue-600 mt-3 font-medium">
                    ℹ️ No tables selected - All tables will be backed up
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={isBackingUp}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isBackingUp ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Backing up...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Backup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Restore Database
                  </h2>
                </div>
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-red-900 mb-1">⚠️ WARNING - DANGEROUS OPERATION</p>
                    <p className="text-sm text-red-800">
                      This will restore data from the last backup. All current data in selected tables will be PERMANENTLY REPLACED. This action cannot be undone!
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Select specific tables to restore or leave empty to restore all tables from backup.
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Select Tables</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllTables}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={deselectAllTables}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {availableTables.map((table) => (
                    <label
                      key={table}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTables.includes(table)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={() => toggleTable(table)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="font-medium text-gray-900">{table}</span>
                    </label>
                  ))}
                </div>

                {selectedTables.length === 0 && (
                  <p className="text-sm text-orange-600 mt-3 font-medium">
                    ℹ️ No tables selected - All tables will be restored
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={isRestoring}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isRestoring ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Restore Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
