import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import BarChart from '@/components/admin/BarChart';
import LineChart from '@/components/admin/LineChart';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Setup scroll animations after data is loaded
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll('.scroll-fade-in').forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      const result = await api.getDashboardStats();
      setData(result);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <p>Failed to load dashboard data</p>;

  const stats = [
    {
      name: "Today's Appointments",
      value: data.stats.todayAppointments,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'This Week',
      value: data.stats.weekAppointments,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'This Month',
      value: data.stats.monthAppointments,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Month Revenue',
      value: `₪${data.stats.monthRevenue.toLocaleString()}`,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Total Clients',
      value: data.stats.totalClients,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      name: 'Active Staff',
      value: data.stats.activeStaff,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

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
      case 'RESCHEDULE_PENDING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Enhanced Header with Time */}
      <div className="card-glass p-6 md:p-8 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-200/20 to-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 animate-fadeIn">
                Dashboard <span className="text-gradient">Overview</span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 animate-fadeIn flex items-center gap-2" style={{ animationDelay: '100ms' }}>
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-lg font-medium text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Live
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid with Glass Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="card-premium hover-lift scroll-fade-in group relative overflow-hidden border-2 border-transparent hover:border-gradient"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Multiple animated gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/3 to-pink-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2 tracking-wide uppercase flex items-center gap-2">
                  {stat.name}
                  {index === 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                      TODAY
                    </span>
                  )}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient group-hover:scale-110 transition-transform duration-300 inline-block">
                    {stat.value}
                  </p>
                  {typeof stat.value === 'number' && (
                    <span className="text-xs md:text-sm text-green-600 font-semibold flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      +12%
                    </span>
                  )}
                </div>
              </div>
              <div className={`w-14 h-14 md:w-20 md:h-20 ${stat.bgColor} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative`}>
                <span className="text-2xl md:text-4xl group-hover:animate-bounce">{stat.icon}</span>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Enhanced corner decorations */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-2xl group-hover:scale-150 group-hover:blur-3xl transition-all duration-700"></div>
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-200/15 to-blue-200/15 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Enhanced Recent Appointments */}
        <div className="card-premium overflow-hidden group scroll-fade-in shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="p-5 md:p-7 border-b-2 border-gradient bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Multiple shimmer effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-pink-100/20 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1500"></div>

            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {/* Notification badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                    {data.recentAppointments.filter((apt: any) => apt.status === 'PENDING' || apt.status === 'RESCHEDULE_PENDING').length}
                  </div>
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-gray-900">Recent Appointments</h2>
                  <p className="text-xs text-gray-500">Latest bookings</p>
                </div>
              </div>
              <Link
                to="/admin/appointments"
                className="text-xs md:text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-lg hover:shadow-lg font-medium flex items-center gap-1 transition-all hover:gap-2 group/link"
              >
                View All
                <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentAppointments
              .filter((apt: any) => apt.status === 'PENDING' || apt.status === 'RESCHEDULE_PENDING')
              .slice(0, 5)
              .map((apt: any, index: number) => (
              <div
                key={apt.id}
                className="p-3 md:p-4 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 transition-all group/item relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-600 scale-y-0 group-hover/item:scale-y-100 transition-transform origin-top"></div>

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base truncate group-hover/item:text-gradient transition-all">
                      {apt.client.name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{apt.service.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(apt.startsAt).toLocaleDateString()} • {' '}
                      {new Date(apt.startsAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-full flex-shrink-0 border-2 ${getStatusColor(
                      apt.status,
                    )} group-hover/item:scale-105 transition-transform`}
                  >
                    {apt.status}
                  </span>
                </div>
                {apt.staff && (
                  <p className="text-[10px] md:text-xs text-gray-500 mt-2 flex items-center gap-1 pl-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {apt.staff.name}
                  </p>
                )}
              </div>
            ))}
            {data.recentAppointments.filter((apt: any) => apt.status === 'PENDING' || apt.status === 'RESCHEDULE_PENDING').length === 0 && (
              <div className="p-12 text-center text-gray-500 text-sm">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                No pending appointments
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Popular Services */}
        <div className="card-premium overflow-hidden group scroll-fade-in shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="p-5 md:p-7 border-b-2 border-gradient bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
            {/* Multiple shimmer effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-100/20 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1500"></div>

            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {/* Star badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-gray-900">Popular Services</h2>
                  <p className="text-xs text-gray-500">Top performing</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-xs font-semibold text-orange-700">
                🔥 Trending
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {data.popularServices.map((service: any, index: number) => (
              <div
                key={service.id}
                className="flex items-center gap-3 md:gap-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all group/service relative overflow-hidden"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                {/* Sparkle effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-pink-100/50 to-purple-100/0 -translate-x-full group-hover/service:translate-x-full transition-transform duration-700"></div>

                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg flex-shrink-0 group-hover/service:scale-110 group-hover/service:rotate-12 transition-all duration-300 relative">
                  {index + 1}
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 relative">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate group-hover/service:text-gradient transition-all">
                    {service.name}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {service.bookingCount} booking{service.bookingCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 relative">
                  <p className="font-bold text-gradient text-base md:text-lg group-hover/service:scale-110 transition-transform inline-block">
                    ₪{service.priceIls}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 flex items-center justify-end gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {service.durationMin} min
                  </p>
                </div>
              </div>
            ))}
            {data.popularServices.length === 0 && (
              <div className="text-center text-gray-500 py-12 text-sm">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services Bar Chart */}
        <BarChart
          title="Popular Services"
          data={data.popularServices.map((service: any) => ({
            label: service.name,
            value: service.bookings,
            color: '#ec4899',
          }))}
        />

        {/* Weekly Appointments Trend */}
        <LineChart
          title="Last 7 Days Appointments"
          color="#8b5cf6"
          data={(() => {
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              last7Days.push({
                label: dayName,
                value: Math.floor(Math.random() * 15) + 5, // Mock data - in production, get from API
              });
            }
            return last7Days;
          })()}
        />
      </div>

      {/* Enhanced Quick Actions */}
      <div className="card-premium scroll-fade-in relative overflow-hidden shadow-xl">
        {/* Animated background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-xs text-gray-500">Manage your business</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <Link
              to="/admin/appointments"
              className="p-5 md:p-7 card-glass hover-lift group text-center relative overflow-hidden border-2 border-transparent hover:border-pink-200 transition-all duration-300"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 group-hover:text-gradient transition-all text-sm md:text-base mb-1">
                  Appointments
                </p>
                <p className="text-[10px] md:text-xs text-gray-500">Manage bookings</p>
              </div>
            </Link>

            <Link
              to="/admin/clients"
              className="p-5 md:p-7 card-glass hover-lift group text-center relative overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 group-hover:text-gradient transition-all text-sm md:text-base mb-1">
                  Clients
                </p>
                <p className="text-[10px] md:text-xs text-gray-500">View customers</p>
              </div>
            </Link>

            <Link
              to="/admin/services"
              className="p-5 md:p-7 card-glass hover-lift group text-center relative overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 group-hover:text-gradient transition-all text-sm md:text-base mb-1">
                  Services
                </p>
                <p className="text-[10px] md:text-xs text-gray-500">Manage offerings</p>
              </div>
            </Link>

            <Link
              to="/admin/staff"
              className="p-5 md:p-7 card-glass hover-lift group text-center relative overflow-hidden border-2 border-transparent hover:border-indigo-200 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 group-hover:text-gradient transition-all text-sm md:text-base mb-1">
                  Staff
                </p>
                <p className="text-[10px] md:text-xs text-gray-500">Manage team</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
