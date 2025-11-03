import { useState } from 'react';

interface CalendarProps {
  appointments: any[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({ appointments, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startsAt);
      // Normalize both dates to local date strings (YYYY-MM-DD) to avoid timezone issues
      const aptDateStr = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
      const compareDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return aptDateStr === compareDateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect?.(date);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayAppointments = getAppointmentsForDate(date);
          const hasAppointments = dayAppointments.length > 0;

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square rounded-lg p-2 text-sm transition-all relative ${
                isToday(day)
                  ? 'bg-primary-100 text-primary-700 font-bold ring-2 ring-primary-500'
                  : isSelected(day)
                  ? 'bg-primary-500 text-white font-semibold'
                  : hasAppointments
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="block">{day}</span>
              {hasAppointments && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {dayAppointments.slice(0, 3).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected(day) ? 'bg-white' : 'bg-primary-500'
                      }`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-100 border-2 border-primary-500 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 rounded"></div>
          <span className="text-gray-600">Has Appointments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-500 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
      </div>
    </div>
  );
}
