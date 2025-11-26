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
    dateFrom: '',
    dateTo: '',
    clientSearch: '',
    serviceId: '',
    staffId: '',
    priceMin: '',
    priceMax: '',
  });
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>('startsAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
  const [newDateTime, setNewDateTime] = useState('');

  useEffect(() => {
    loadAppointments();
    loadAllAppointments();
    loadServicesAndStaff();
  }, [filters, currentPage]);

  const loadServicesAndStaff = async () => {
    try {
      const [servicesData, staffData] = await Promise.all([
        api.getAllServices(1, 100),
        api.getAllStaff(1, 100),
      ]);
      setServices(Array.isArray(servicesData.data) ? servicesData.data : []);
      setStaff(Array.isArray(staffData.data) ? staffData.data : []);
    } catch (error) {
      console.error('Failed to load services/staff:', error);
      setServices([]);
      setStaff([]);
    }
  };

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

  const setQuickFilter = (type: 'today' | 'week' | 'month' | 'upcoming') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    switch (type) {
      case 'today':
        setFilters({ ...filters, date: todayStr, dateFrom: '', dateTo: '' });
        break;
      case 'week':
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
        setFilters({ ...filters, date: '', dateFrom: todayStr, dateTo: weekEndStr });
        break;
      case 'month':
        const monthEnd = new Date(today);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        const monthEndStr = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
        setFilters({ ...filters, date: '', dateFrom: todayStr, dateTo: monthEndStr });
        break;
      case 'upcoming':
        setFilters({ ...filters, date: '', dateFrom: todayStr, dateTo: '', status: 'CONFIRMED' });
        break;
    }
  };

  const clearAllFilters = () => {
    setFilters({
      status: '',
      date: '',
      dateFrom: '',
      dateTo: '',
      clientSearch: '',
      serviceId: '',
      staffId: '',
      priceMin: '',
      priceMax: '',
    });
    setSelectedDate(undefined);
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

  const handlePriceChange = async (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    try {
      await api.updateAppointmentPrice(id, newPrice);
      toast.success('Appointment price updated successfully');
      loadAppointments();
      loadAllAppointments();
    } catch (error: any) {
      console.error('Failed to update price:', error);
      toast.error(error.message || 'Failed to update appointment price');
    }
  };

  const handlePaymentMethodChange = async (id: string, paymentMethod: string) => {
    try {
      await api.request(`/admin/appointments/${id}/payment-method`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentMethod }),
      });
      toast.success('Payment method updated');
      loadAppointments();
      loadAllAppointments();
    } catch (error: any) {
      console.error('Failed to update payment method:', error);
      toast.error(error.message || 'Failed to update payment method');
    }
  };

  const openRescheduleModal = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    // Format the current date and time for the datetime-local input
    const date = new Date(appointment.startsAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    setNewDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    setShowRescheduleModal(true);
  };

  const handleReschedule = async () => {
    if (!appointmentToReschedule || !newDateTime) return;
    try {
      const startsAt = new Date(newDateTime).toISOString();
      await api.rescheduleAppointment(appointmentToReschedule.id, startsAt);
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setAppointmentToReschedule(null);
      setNewDateTime('');
      loadAppointments();
      loadAllAppointments();
    } catch (error: any) {
      console.error('Failed to reschedule appointment:', error);
      toast.error(error.message || 'Failed to reschedule appointment. The time slot may not be available.');
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
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30"></div>

        {/* Header content */}
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Appointments
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage and monitor all appointments</p>
              </div>
            </div>

            {/* Stats badges */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl px-4 py-2.5">
                <div className="text-xs text-blue-600 font-medium">Total</div>
                <div className="text-xl font-bold text-blue-900">{pagination.total}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-2.5">
                <div className="text-xs text-green-600 font-medium">Today</div>
                <div className="text-xl font-bold text-green-900">
                  {appointments.filter(apt => {
                    const today = new Date().toDateString();
                    return new Date(apt.startsAt).toDateString() === today;
                  }).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Filters & Controls */}
      <div className="bg-white border border-gray-200/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">View Options</h2>
              <p className="text-xs text-gray-500">Manage your appointments view</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filters Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all shadow-sm hover:shadow font-medium text-sm ${
                showFilters
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            {/* Export Buttons */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-all shadow-sm hover:shadow font-medium text-sm"
              title="Export to CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-all shadow-sm hover:shadow font-medium text-sm"
              title="Export to PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1"></div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  viewMode === 'table'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  viewMode === 'calendar'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters Section */}
        {showFilters && (
          <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
            {/* Quick Filters - More Professional */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setQuickFilter('today')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all text-sm font-semibold shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Today
          </button>
          <button
            onClick={() => setQuickFilter('week')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 text-purple-700 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all text-sm font-semibold shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            This Week
          </button>
          <button
            onClick={() => setQuickFilter('month')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 text-green-700 rounded-xl hover:from-green-100 hover:to-green-200 transition-all text-sm font-semibold shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            This Month
          </button>
          <button
            onClick={() => setQuickFilter('upcoming')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 text-orange-700 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all text-sm font-semibold shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Upcoming
          </button>
        </div>

        {/* Basic Filters - Professional Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="CONFIRMED">✅ Confirmed</option>
              <option value="COMPLETED">✓ Completed</option>
              <option value="CANCELLED">✗ Cancelled</option>
              <option value="NO_SHOW">⊘ No Show</option>
              <option value="RESCHEDULE">🔄 Reschedule</option>
              <option value="RESCHEDULE_PENDING">⏳🔄 Reschedule Pending</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value, dateFrom: '', dateTo: '' })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              Client Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.clientSearch}
                onChange={(e) => setFilters({ ...filters, clientSearch: e.target.value })}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium text-gray-700 placeholder-gray-400 transition-all hover:border-gray-300"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 text-indigo-700 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all text-sm font-semibold shadow-sm hover:shadow"
            >
              <svg className={`w-4 h-4 inline-block mr-1.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="hidden sm:inline">Advanced</span>
            </button>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 rounded-xl hover:from-red-100 hover:to-rose-100 transition-all font-semibold shadow-sm hover:shadow"
              title="Clear all filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced Filters - Professional Design */}
        {showAdvancedFilters && (
          <div className="border-t-2 border-gray-200 pt-6 mt-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Advanced Filters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Service</label>
                <select
                  value={filters.serviceId}
                  onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">All Services</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Staff Member</label>
                <select
                  value={filters.staffId}
                  onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">All Staff</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, date: '' })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, date: '' })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Price Range (₪)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 placeholder-gray-400 transition-all hover:border-gray-300"
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-700 placeholder-gray-400 transition-all hover:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      {/* Professional Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULE', 'RESCHEDULE_PENDING'].map((status, index) => {
          const count = appointments.filter((apt) => apt.status === status).length;
          const statusConfig = {
            PENDING: {
              bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
              border: 'border-amber-200',
              iconBg: 'bg-amber-500',
              textColor: 'text-amber-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            CONFIRMED: {
              bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
              border: 'border-blue-200',
              iconBg: 'bg-blue-500',
              textColor: 'text-blue-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            COMPLETED: {
              bg: 'bg-gradient-to-br from-green-50 to-green-100',
              border: 'border-green-200',
              iconBg: 'bg-green-500',
              textColor: 'text-green-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )
            },
            CANCELLED: {
              bg: 'bg-gradient-to-br from-red-50 to-red-100',
              border: 'border-red-200',
              iconBg: 'bg-red-500',
              textColor: 'text-red-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )
            },
            NO_SHOW: {
              bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
              border: 'border-gray-200',
              iconBg: 'bg-gray-500',
              textColor: 'text-gray-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )
            },
            RESCHEDULE: {
              bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
              border: 'border-orange-200',
              iconBg: 'bg-orange-500',
              textColor: 'text-orange-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )
            },
            RESCHEDULE_PENDING: {
              bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
              border: 'border-purple-200',
              iconBg: 'bg-purple-500',
              textColor: 'text-purple-700',
              icon: (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9" />
                </svg>
              )
            },
          }[status as keyof typeof statusConfig];

          return (
            <div
              key={status}
              className={`${statusConfig.bg} border ${statusConfig.border} rounded-xl p-4 hover:shadow-lg transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${statusConfig.iconBg} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  {statusConfig.icon}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 ${statusConfig.textColor} bg-white/70 rounded-md`}>
                  {status === 'NO_SHOW' ? 'No Show' : status === 'RESCHEDULE_PENDING' ? 'Reschedule Pending' : status === 'RESCHEDULE' ? 'Reschedule' : status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Total</p>
                <p className={`text-3xl font-bold ${statusConfig.textColor}`}>{count}</p>
              </div>
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
            <div className="bg-white border border-gray-200/50 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedDate
                        ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        : 'Select a date'}
                    </h3>
                    <p className="text-xs text-gray-500">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled</p>
                  </div>
                </div>
              </div>

              {appointments.length > 0 ? (
                <div className="space-y-3 relative">
                  {appointments.map((apt, index) => {
                    const statusConfig = {
                      PENDING: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⏳', iconBg: 'bg-amber-500' },
                      CONFIRMED: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '✅', iconBg: 'bg-blue-500' },
                      COMPLETED: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✓', iconBg: 'bg-green-500' },
                      CANCELLED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '✗', iconBg: 'bg-red-500' },
                      NO_SHOW: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: '⊘', iconBg: 'bg-gray-500' },
                      RESCHEDULE: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '🔄', iconBg: 'bg-orange-500' },
                      RESCHEDULE_PENDING: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '⏳🔄', iconBg: 'bg-purple-500' }
                    }[apt.status];

                    return (
                    <div
                      key={apt.id}
                      className={`${statusConfig.bg} border ${statusConfig.border} rounded-xl p-4 hover:shadow-md transition-all duration-200 relative`}
                    >
                      {/* Status indicator dot */}
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 ${statusConfig.iconBg} rounded-r`}></div>

                      <div className="pl-4">
                        {/* Header with Time */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                              {apt.client.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-base truncate">{apt.client.name}</h4>
                              <p className="text-xs text-gray-500 truncate">{apt.client.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(apt.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Service & Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {/* Service */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1.5">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-gray-500 font-medium">Service</span>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">{apt.service.name}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {apt.service.durationMin}min
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={apt.priceIls ?? apt.service.priceIls}
                                  onChange={(e) => handlePriceChange(apt.id, parseFloat(e.target.value))}
                                  className="w-20 px-2 py-1 text-xs font-bold text-purple-700 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                  min="0"
                                  step="10"
                                />
                                <span className="text-purple-700 font-bold">₪</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <select
                                value={apt.paymentMethod || 'NOT_PAID'}
                                onChange={(e) => handlePaymentMethodChange(apt.id, e.target.value)}
                                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="NOT_PAID">💸 Not Paid</option>
                                <option value="CASH">💵 Cash</option>
                                <option value="CREDIT_CARD">💳 Credit Card</option>
                                <option value="DEBIT_CARD">🏦 Debit Card</option>
                                <option value="BIT">📱 Bit</option>
                                <option value="PAYBOX">📦 Paybox</option>
                                <option value="BANK_TRANSFER">🏛️ Bank Transfer</option>
                                <option value="OTHER">❓ Other</option>
                              </select>
                            </div>
                          </div>

                          {/* Staff */}
                          {apt.staff && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1.5">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs text-gray-500 font-medium">Staff Member</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {apt.staff.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{apt.staff.name}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <select
                              value={apt.status}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                              className={`w-full text-sm font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all border ${statusConfig.border} ${statusConfig.text} ${statusConfig.bg}`}
                            >
                              <option value="PENDING">⏳ Pending</option>
                              <option value="CONFIRMED">✅ Confirmed</option>
                              <option value="COMPLETED">✓ Completed</option>
                              <option value="CANCELLED">✗ Cancelled</option>
                              <option value="NO_SHOW">⊘ No Show</option>
                              <option value="RESCHEDULE">🔄 Reschedule</option>
                              <option value="RESCHEDULE_PENDING">⏳🔄 Reschedule Pending</option>
                            </select>
                          </div>
                          <button
                            onClick={() => openRescheduleModal(apt)}
                            className="px-4 py-2.5 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm"
                            title="Reschedule appointment"
                          >
                            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setAppointmentToDelete(apt);
                              setShowDeleteModal(true);
                            }}
                            className="px-4 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all font-medium text-sm"
                            title="Delete appointment"
                          >
                            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* Professional Table View */}
      {viewMode === 'table' && (
        <div className="bg-white border border-gray-200/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            All Appointments <span className="text-gray-500 font-normal">({appointments.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => handleSort('client')}
                  className="group px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Client
                    <SortIcon field="client" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('service')}
                  className="group px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Service
                    <SortIcon field="service" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('staff')}
                  className="group hidden lg:table-cell px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Staff
                    <SortIcon field="staff" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('startsAt')}
                  className="group px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Date & Time
                    <SortIcon field="startsAt" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="group hidden sm:table-cell px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedAppointments.map((apt) => {
                const statusConfig = {
                  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
                  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
                  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
                  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
                  NO_SHOW: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
                  RESCHEDULE: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
                  RESCHEDULE_PENDING: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' }
                }[apt.status];

                return (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {apt.client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{apt.client.name}</p>
                          <p className="text-xs text-gray-500 truncate">{apt.client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{apt.service.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span>{apt.service.durationMin}min</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={apt.priceIls ?? apt.service.priceIls}
                            onChange={(e) => handlePriceChange(apt.id, parseFloat(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-xs font-medium border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            min="0"
                            step="10"
                          />
                          <span>₪</span>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <select
                          value={apt.paymentMethod || 'NOT_PAID'}
                          onChange={(e) => handlePaymentMethodChange(apt.id, e.target.value)}
                          className="text-xs px-1.5 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="NOT_PAID">💸 Not Paid</option>
                          <option value="CASH">💵 Cash</option>
                          <option value="CREDIT_CARD">💳 Credit Card</option>
                          <option value="DEBIT_CARD">🏦 Debit Card</option>
                          <option value="BIT">📱 Bit</option>
                          <option value="PAYBOX">📦 Paybox</option>
                          <option value="BANK_TRANSFER">🏛️ Bank Transfer</option>
                          <option value="OTHER">❓ Other</option>
                        </select>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4">
                      {apt.staff ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {apt.staff.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900 text-sm font-medium">{apt.staff.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 text-sm font-medium">
                        {new Date(apt.startsAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(apt.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {' '}-{' '}
                        {new Date(apt.endsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${statusConfig.border} ${statusConfig.text} ${statusConfig.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white font-medium text-gray-700"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                          <option value="RESCHEDULE">Reschedule</option>
                          <option value="RESCHEDULE_PENDING">Reschedule Pending</option>
                        </select>
                        <button
                          onClick={() => openRescheduleModal(apt)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reschedule appointment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setAppointmentToDelete(apt);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete appointment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
      {/* Reschedule Modal */}
      {showRescheduleModal && appointmentToReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Reschedule Appointment</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Client:</strong> {appointmentToReschedule.client.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Service:</strong> {appointmentToReschedule.service.name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Duration:</strong> {appointmentToReschedule.service.durationMin} minutes
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date & Time
              </label>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                The system will check if the selected time is available for the staff member and service duration.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setAppointmentToReschedule(null);
                  setNewDateTime('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

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
