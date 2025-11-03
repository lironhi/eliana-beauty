import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Service {
  id: string;
  name: string;
  priceIls: number;
  durationMin: number;
  category: {
    name: string;
  };
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeOff {
  type: 'SICK_LEAVE' | 'VACATION' | 'OTHER';
  startsAt: string;
  endsAt: string;
}

export default function Booking() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [dateTimeOffs, setDateTimeOffs] = useState<Map<string, TimeOff>>(new Map());

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/booking${serviceId ? `?serviceId=${serviceId}` : ''}` } });
      return;
    }
    loadInitialData();
  }, [user, navigate, serviceId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [servicesData, staffData] = await Promise.all([
        api.getServices(),
        api.getStaff(),
      ]);

      setServices(servicesData);
      setStaff(staffData);

      // Pre-select service if provided
      if (serviceId) {
        const service = servicesData.find((s: Service) => s.id === serviceId);
        if (service) {
          setSelectedService(service);
          setStep(2);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const checkDateTimeOffs = async () => {
    if (!selectedStaff) {
      setDateTimeOffs(new Map());
      return;
    }

    try {
      const dates = getAvailableDates();
      const timeOffMap = new Map<string, TimeOff>();

      // Check each date for time-off
      for (const date of dates) {
        try {
          const response = await api.getAvailability(selectedStaff, date);
          if (response.timeOff) {
            timeOffMap.set(date, response.timeOff);
          }
        } catch (error) {
          // Ignore errors for individual dates
        }
      }

      setDateTimeOffs(timeOffMap);
    } catch (error) {
      console.error('Failed to check time offs:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate) {
      return;
    }

    try {
      const params: any = {
        date: selectedDate,
        serviceId: selectedService.id,
      };
      if (selectedStaff) {
        params.staffId = selectedStaff;
      }

      const response = await api.getAvailableSlots(params);

      // Extract the slots array from the response
      const slotsArray = Array.isArray(response) ? response : (response.slots || []);
      setAvailableSlots(slotsArray);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedService, selectedStaff]);

  useEffect(() => {
    if (step === 3 && selectedStaff) {
      checkDateTimeOffs();
    }
  }, [selectedStaff, step]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId);
    setStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(5);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError('');

    try {
      // Extract time in HH:MM format if it's an ISO string
      let timeStr = selectedTime;
      if (selectedTime.includes('T')) {
        // It's an ISO string, extract the time part
        const date = new Date(selectedTime);
        timeStr = date.toTimeString().slice(0, 5); // Get HH:MM
      }

      // Combine date and time into ISO datetime string
      const startsAt = `${selectedDate}T${timeStr}:00`;

      await api.createAppointment({
        serviceId: selectedService.id,
        staffId: selectedStaff || undefined,
        startsAt: startsAt,
        notes: notes || undefined,
      });

      navigate('/bookings', { state: { message: t('booking.bookingSuccess') } });
    } catch (err: any) {
      setError(err.message || t('booking.bookingError'));
      setSubmitting(false);
    }
  };

  // Generate next 30 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(t('common.locale') || 'en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    // If it's already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    // If it's an ISO string, extract the time
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/services" className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('booking.title')} <span className="text-gradient">{t('booking.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-gray-600">{t('booking.subtitle')}</p>
        </div>

        {/* Progress Steps */}
        <div className="card-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: t('booking.step1') },
              { num: 2, label: t('booking.step2') },
              { num: 3, label: t('booking.step3') },
              { num: 4, label: t('booking.step4') },
              { num: 5, label: t('booking.step5') },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step >= s.num
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="text-xs mt-2 text-center hidden sm:block">{s.label}</span>
                </div>
                {index < 4 && (
                  <div
                    className={`h-1 flex-1 transition-all duration-300 ${
                      step > s.num ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="card-premium p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{t('booking.selectService')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="card-premium p-6 text-left hover-lift"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    <span className="badge-premium">{service.category.name}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600">{service.durationMin} {t('services.minutes')}</span>
                    <span className="text-2xl font-bold text-gradient">₪{service.priceIls}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Staff */}
        {step === 2 && selectedService && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{t('booking.selectStaff')}</h2>
            <div className="card-premium p-4 mb-4 bg-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{selectedService.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedService.durationMin} {t('services.minutes')} • ₪{selectedService.priceIls}
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-pink-600 hover:text-pink-700">
                  {t('common.change')}
                </button>
              </div>
            </div>
            <button
              onClick={() => handleStaffSelect('')}
              className="w-full card p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{t('booking.anyStaff')}</div>
                  <div className="text-sm text-gray-500">{t('booking.anyStaffDesc')}</div>
                </div>
              </div>
            </button>
            {staff.map((member) => (
              <button
                key={member.id}
                onClick={() => handleStaffSelect(member.id)}
                className="w-full card p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Select Date */}
        {step === 3 && selectedService && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{t('booking.selectDate')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getAvailableDates().map((date) => {
                const timeOff = dateTimeOffs.get(date);
                const isBlocked = !!timeOff;

                return (
                  <button
                    key={date}
                    onClick={() => !isBlocked && handleDateSelect(date)}
                    disabled={isBlocked}
                    className={`card p-4 text-center transition-all ${
                      isBlocked
                        ? 'bg-black text-white cursor-not-allowed opacity-80'
                        : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                    }`}
                  >
                    <div className={`font-bold ${isBlocked ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(date).toLocaleDateString(t('common.locale') || 'en', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className={`text-sm ${isBlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(date).toLocaleDateString(t('common.locale') || 'en', { weekday: 'short' })}
                    </div>
                    {isBlocked && (
                      <div className="text-xs text-gray-300 mt-1">
                        {timeOff.type === 'SICK_LEAVE' ? '🤒 Sick' : timeOff.type === 'VACATION' ? '🏖️ Vacation' : '📋 Unavailable'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Select Time */}
        {step === 4 && selectedService && selectedDate && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{t('booking.selectTime')}</h2>
            <div className="card-premium p-4 mb-4 bg-purple-50">
              <div className="font-bold">{formatDate(selectedDate)}</div>
            </div>
            {availableSlots.length === 0 ? (
              <div className="card p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600">{t('booking.noSlotsAvailable')}</p>
                <button onClick={() => setStep(3)} className="btn-secondary mt-4">
                  {t('booking.chooseDifferentDate')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`card p-3 text-center transition-all font-semibold ${
                      slot.available
                        ? 'hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white cursor-pointer'
                        : 'opacity-50 cursor-not-allowed bg-gray-100'
                    }`}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Add Notes & Confirm */}
        {step === 5 && selectedService && selectedDate && selectedTime && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">{t('booking.reviewAndConfirm')}</h2>

            {/* Booking Summary */}
            <div className="card-premium p-6 space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <div className="font-bold text-lg">{selectedService.name}</div>
                  <div className="text-sm text-gray-600">{selectedService.category.name}</div>
                </div>
                <div className="text-2xl font-bold text-gradient">₪{selectedService.priceIls}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">{t('booking.date')}</div>
                  <div className="font-semibold">{formatDate(selectedDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t('booking.time')}</div>
                  <div className="font-semibold">{formatTime(selectedTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t('booking.duration')}</div>
                  <div className="font-semibold">{selectedService.durationMin} {t('services.minutes')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t('booking.staff')}</div>
                  <div className="font-semibold">
                    {selectedStaff ? staff.find((s) => s.id === selectedStaff)?.name : t('booking.anyStaff')}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('booking.addNotes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder={t('booking.notesPlaceholder')}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button onClick={() => setStep(4)} className="btn-secondary flex-1">
                {t('common.back')}
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 text-lg py-4">
                {submitting ? t('common.loading') : t('booking.confirmBooking')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
