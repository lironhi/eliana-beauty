import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyBookings() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">{t('myBookings.title')}</h1>

      {bookings.length === 0 ? (
        <div className="card p-8 md:p-12 text-center">
          <p className="text-gray-500 text-sm md:text-base">{t('myBookings.noBookings')}</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {booking.service.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 md:py-1 text-xs font-medium rounded ${getStatusColor(
                        booking.status,
                      )}`}
                    >
                      {t(`myBookings.status.${booking.status}`)}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-gray-600 mb-2">
                    {booking.service.category.name}
                  </p>

                  <div className="space-y-1">
                    <p className="text-xs md:text-sm text-gray-700">
                      <strong className="font-semibold">📅 </strong>
                      {new Date(booking.startsAt).toLocaleDateString()}
                    </p>

                    <p className="text-xs md:text-sm text-gray-700">
                      <strong className="font-semibold">🕐 </strong>
                      {new Date(booking.startsAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </p>

                    {booking.staff && (
                      <p className="text-xs md:text-sm text-gray-700">
                        <strong className="font-semibold">👤 </strong>
                        {booking.staff.name}
                      </p>
                    )}

                    {booking.notes && (
                      <p className="text-xs md:text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
                        <strong className="font-semibold">📝 </strong>
                        {booking.notes}
                      </p>
                    )}
                  </div>
                </div>

                {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="btn-secondary text-xs md:text-sm w-full md:w-auto px-3 py-2 whitespace-nowrap"
                  >
                    {t('myBookings.cancelBooking')}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
