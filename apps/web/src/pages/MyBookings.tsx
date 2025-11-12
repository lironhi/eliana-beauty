import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format, isPast, isFuture, isToday } from 'date-fns';

type FilterType = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function MyBookings() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.getMyAppointments();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t('myBookings.cancelConfirm'))) return;

    try {
      await api.cancelAppointment(id);
      toast.success(t('myBookings.cancelSuccess') || 'Booking cancelled successfully');
      loadBookings();
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'PENDING':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'CANCELLED':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-pink-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'COMPLETED':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: null
        };
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startsAt);

    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && isFuture(bookingDate);
    }
    if (filter === 'past') {
      return booking.status === 'COMPLETED' || (isPast(bookingDate) && booking.status !== 'CANCELLED');
    }
    if (filter === 'cancelled') {
      return booking.status === 'CANCELLED';
    }
    return true;
  });

  if (loading) return <LoadingSpinner />;

  const filterButtons = [
    { key: 'all', label: t('myBookings.filters.all') || 'All', icon: '📋' },
    { key: 'upcoming', label: t('myBookings.filters.upcoming') || 'Upcoming', icon: '⏰' },
    { key: 'past', label: t('myBookings.filters.past') || 'Past', icon: '✓' },
    { key: 'cancelled', label: t('myBookings.filters.cancelled') || 'Cancelled', icon: '✕' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t('myBookings.title')}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key as FilterType)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                  filter === btn.key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' ? t('myBookings.noBookings') : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Start booking your beauty treatments today!'
                : `You don't have any ${filter} appointments.`}
            </p>
            <a
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Now
            </a>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {filteredBookings.map((booking, index) => {
              const statusBadge = getStatusBadge(booking.status);
              const bookingDate = new Date(booking.startsAt);
              const isUpcoming = isFuture(bookingDate) && (booking.status === 'CONFIRMED' || booking.status === 'PENDING');
              const isTodayBooking = isToday(bookingDate);

              return (
                <div
                  key={booking.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Colored Top Border */}
                  <div className={`h-2 ${statusBadge.bg}`}></div>

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left Section - Service Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Service Image */}
                          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 shadow-md">
                            {booking.service.imageUrl ? (
                              <img
                                src={booking.service.imageUrl}
                                alt={booking.service.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <svg class="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                      </svg>
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                {booking.service.name}
                              </h3>
                              {isTodayBooking && isUpcoming && (
                                <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full animate-pulse">
                                  Today
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-pink-400"></span>
                              {booking.service.category.name}
                            </p>

                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}>
                              {statusBadge.icon}
                              <span className="text-xs font-semibold">
                                {t(`myBookings.status.${booking.status}`)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {/* Date */}
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {format(bookingDate, 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Time</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {format(bookingDate, 'HH:mm')}
                              </p>
                            </div>
                          </div>

                          {/* Staff */}
                          {booking.staff && (
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:col-span-2">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Specialist</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {booking.staff.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-1">Notes</p>
                                <p className="text-sm text-blue-900">{booking.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Actions */}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <div className="flex flex-col gap-2 lg:w-48">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-2 border-red-200 rounded-xl font-semibold hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2 group"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t('myBookings.cancelBooking')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
