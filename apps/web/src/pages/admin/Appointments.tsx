import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Calendar from '@/components/admin/Calendar';
import { exportToCSV, exportToPDF, formatAppointmentsForExport } from '@/lib/export';
import { Pagination } from '@/components/Pagination';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    date: '',
  });
  const [sortField, setSortField] = useState<string>('startsAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);

  useEffect(() => {
    loadAppointments();
    loadAllAppointments();
  }, [filters, currentPage]);

  const loadAppointments = async () => {
    try {
      const data = await api.getAllAppointments({ ...filters, page: currentPage, limit: 10 });
      setAppointments(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllAppointments = async () => {
    try {
      const data = await api.getAllAppointments();
      setAllAppointments(data.data);
    } catch (error) {
      console.error('Failed to load all appointments:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Format date as YYYY-MM-DD in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    setFilters({
      ...filters,
      date: localDateStr,
    });
  };

  const handleExportCSV = () => {
    const data = formatAppointmentsForExport(appointments);
    const filename = `appointments-${new Date().toISOString().split('T')[0]}`;
    exportToCSV(data, filename);
  };

  const handleExportPDF = () => {
    const data = formatAppointmentsForExport(appointments);
    const filename = `appointments-${new Date().toISOString().split('T')[0]}`;
    exportToPDF(data, filename);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      toast.success('Appointment status updated successfully');
      loadAppointments();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.message || 'Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      await api.deleteAppointment(appointmentToDelete.id);
      toast.success('Appointment deleted successfully');
      loadAppointments();
      loadAllAppointments();
    } catch (error: any) {
      console.error('Failed to delete appointment:', error);
      toast.error(error.message || 'Failed to delete appointment');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'client':
        aValue = a.client.name.toLowerCase();
        bValue = b.client.name.toLowerCase();
        break;
      case 'service':
        aValue = a.service.name.toLowerCase();
        bValue = b.service.name.toLowerCase();
        break;
      case 'staff':
        aValue = (a.staff?.name || 'zzz').toLowerCase();
        bValue = (b.staff?.name || 'zzz').toLowerCase();
        break;
      case 'startsAt':
        aValue = new Date(a.startsAt).getTime();
        bValue = new Date(b.startsAt).getTime();
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'RESCHEDULE_PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="card-glass p-4 md:p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse-slow">
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 animate-fadeIn">
              Appointments <span className="text-gradient">Management</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600">Manage and track all customer appointments</p>
          </div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="card-premium p-4 md:p-6 group relative overflow-hidden">
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Filters & View</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg hover:from-green-200 hover:to-emerald-200 transition-all font-medium text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-green-200"
              title="Export to CSV"
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all font-medium text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-blue-200"
              title="Export to PDF"
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>
            <div className="hidden sm:block border-l border-gray-300 mx-1 md:mx-2"></div>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg font-semibold transition-all text-sm group/btn relative overflow-hidden ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg font-semibold transition-all text-sm group/btn relative overflow-hidden ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', date: '' })}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((status, index) => {
          const count = appointments.filter((apt) => apt.status === status).length;
          const statusColors = {
            PENDING: 'from-yellow-50 to-yellow-100',
            CONFIRMED: 'from-green-50 to-green-100',
            COMPLETED: 'from-blue-50 to-blue-100',
            CANCELLED: 'from-red-50 to-red-100',
            NO_SHOW: 'from-gray-50 to-gray-100',
          };
          const statusIcons = {
            PENDING: '⏳',
            CONFIRMED: '✅',
            COMPLETED: '✔️',
            CANCELLED: '❌',
            NO_SHOW: '👻',
          };
          return (
            <div
              key={status}
              className={`card-premium bg-gradient-to-br ${statusColors[status as keyof typeof statusColors]} hover-lift group relative overflow-hidden`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Animated background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1 tracking-wide uppercase">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gradient group-hover:scale-110 transition-transform inline-block">
                    {count}
                  </p>
                </div>
                <div className="text-2xl md:text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all">
                  {statusIcons[status as keyof typeof statusIcons]}
                </div>
              </div>

              {/* Decorative corner element */}
              <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          );
        })}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <Calendar
              appointments={allAppointments}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="card-premium p-4 md:p-6 relative overflow-hidden group">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                  {selectedDate
                    ? `Appointments for ${selectedDate.toLocaleDateString()}`
                    : 'Select a date to view appointments'}
                </h3>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-3 md:space-y-4 relative">
                  {appointments.map((apt, index) => (
                    <div
                      key={apt.id}
                      className="border-2 border-gray-200 rounded-xl p-3 md:p-4 hover:border-pink-300 hover:shadow-lg transition-all bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 group/item relative overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-600 scale-y-0 group-hover/item:scale-y-100 transition-transform origin-top"></div>

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2 pl-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate group-hover/item:text-gradient transition-all text-base md:text-lg">
                            {apt.client.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {apt.service.name}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${getStatusColor(
                            apt.status,
                          )} whitespace-nowrap self-start group-hover/item:scale-105 transition-transform shadow-sm`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3 pl-2">
                        <span className="flex items-center gap-1.5 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {new Date(apt.startsAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(apt.endsAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {apt.staff && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {apt.staff.name}
                          </span>
                        )}
                      </div>
                      <div className="pl-2 flex gap-2">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className="flex-1 text-xs md:text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white hover:border-pink-300 font-medium"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                        </select>
                        <button
                          onClick={() => {
                            setAppointmentToDelete(apt);
                            setShowDeleteModal(true);
                          }}
                          className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border-2 border-red-200"
                          title="Delete appointment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-gray-500">
                    {selectedDate ? 'No appointments for this date' : 'Select a date to view appointments'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {viewMode === 'table' && (
        <div className="card-premium overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            All Appointments ({appointments.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => handleSort('client')}
                  className="group px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-pink-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Client
                    <SortIcon field="client" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('service')}
                  className="group px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-pink-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Service
                    <SortIcon field="service" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('staff')}
                  className="group hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-pink-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Staff
                    <SortIcon field="staff" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('startsAt')}
                  className="group px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-pink-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Date & Time
                    <SortIcon field="startsAt" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="group hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-pink-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-purple-50/30 transition-all">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">{apt.client.name}</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">{apt.client.email}</p>
                      {apt.client.phone && (
                        <p className="text-xs md:text-sm text-gray-500">{apt.client.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <p className="font-medium text-gray-900 text-sm md:text-base">{apt.service.name}</p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {apt.service.durationMin} min • ₪{apt.service.priceIls}
                    </p>
                  </td>
                  <td className="hidden lg:table-cell px-3 md:px-6 py-3 md:py-4">
                    <p className="text-gray-900 text-sm md:text-base">{apt.staff?.name || 'Any staff'}</p>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <p className="text-gray-900 text-sm md:text-base whitespace-nowrap">
                      {new Date(apt.startsAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                      {new Date(apt.startsAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(apt.endsAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4">
                    <span
                      className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        apt.status,
                      )}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex gap-2">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className="flex-1 text-xs md:text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                      <button
                        onClick={() => {
                          setAppointmentToDelete(apt);
                          setShowDeleteModal(true);
                        }}
                        className="px-2 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        title="Delete appointment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-gray-500 text-sm md:text-base">
                No appointments found. Try adjusting your filters.
              </p>
            </div>
          )}
          {appointments.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {appointmentToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setAppointmentToDelete(null);
          }}
          onConfirm={handleDeleteAppointment}
          title="Delete Appointment"
          itemName={`${appointmentToDelete.client.name} - ${appointmentToDelete.service.name}`}
          itemType="appointment"
          warningMessage="This appointment will be permanently deleted. This action cannot be undone."
        />
      )}
    </div>
  );
}
