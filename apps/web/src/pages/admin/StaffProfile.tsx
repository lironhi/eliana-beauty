import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import TimeOffList from '@/components/admin/TimeOffList';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

interface Service {
  id: string;
  name: string;
  category: { name: string };
  durationMin: number;
  priceIls: number;
}

interface WorkingHours {
  id: string;
  weekday: number;
  startHhmm: string;
  endHhmm: string;
}

interface StaffMember {
  id: string;
  name: string;
  bio: string | null;
  active: boolean;
  staffServices: Array<{ service: Service }>;
  workingHours: WorkingHours[];
  _count?: { appointments: number };
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'hours' | 'timeoff'>('info');
  const [timeOffRefreshTrigger, setTimeOffRefreshTrigger] = useState(0);

  // Edit states
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingServices, setEditingServices] = useState(false);
  const [editingHours, setEditingHours] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [active, setActive] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<Array<{ weekday: number; startHhmm: string; endHhmm: string }>>([]);

  // Time off modal state
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [editingTimeOffId, setEditingTimeOffId] = useState<string | null>(null);
  const [timeOffType, setTimeOffType] = useState<'SICK_LEAVE' | 'VACATION' | 'OTHER'>('VACATION');
  const [timeOffStartsAt, setTimeOffStartsAt] = useState('');
  const [timeOffEndsAt, setTimeOffEndsAt] = useState('');
  const [timeOffReason, setTimeOffReason] = useState('');
  const [timeOffLoading, setTimeOffLoading] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, servicesData] = await Promise.all([
        fetch(`http://localhost:3001/staff/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }).then((res) => res.json()),
        api.getAllServices(),
      ]);

      setStaff(staffData);
      setServices(servicesData.data);
      setName(staffData.name);
      setBio(staffData.bio || '');
      setActive(staffData.active);
      setSelectedServiceIds(staffData.staffServices.map((ss: any) => ss.service.id));
      setWorkingHours(
        staffData.workingHours.map((wh: any) => ({
          weekday: wh.weekday,
          startHhmm: wh.startHhmm,
          endHhmm: wh.endHhmm,
        }))
      );
    } catch (error: any) {
      console.error('Failed to load staff data:', error);
      toast.error(error.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    try {
      await api.updateStaff(id!, { name, bio, active });
      toast.success('Staff information updated successfully');
      setEditingInfo(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to update staff:', error);
      toast.error(error.message || 'Failed to update staff');
    }
  };

  const handleSaveServices = async () => {
    try {
      await api.updateStaffServices(id!, selectedServiceIds);
      toast.success('Services updated successfully');
      setEditingServices(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to update services:', error);
      toast.error(error.message || 'Failed to update services');
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSaveWorkingHours = async () => {
    try {
      await api.updateStaffWorkingHours(id!, workingHours);
      toast.success('Working hours updated successfully');
      setEditingHours(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to update working hours:', error);
      toast.error(error.message || 'Failed to update working hours');
    }
  };

  const addWorkingHour = () => {
    setWorkingHours([...workingHours, { weekday: 0, startHhmm: '09:00', endHhmm: '17:00' }]);
  };

  const removeWorkingHour = (index: number) => {
    setWorkingHours(workingHours.filter((_, i) => i !== index));
  };

  const updateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const handleTimeOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeOffLoading(true);

    try {
      // Convert dates to ISO format
      const startsAtISO = new Date(timeOffStartsAt).toISOString();
      const endsAtISO = new Date(timeOffEndsAt).toISOString();

      const data = {
        type: timeOffType,
        startsAt: startsAtISO,
        endsAt: endsAtISO,
        reason: timeOffReason || undefined,
      };

      const result = editingTimeOffId
        ? await api.updateTimeOff(editingTimeOffId, data)
        : await api.createTimeOff(id!, data);

      if (!editingTimeOffId && result.affectedAppointments > 0) {
        toast.success(
          `Time off created. ${result.affectedAppointments} appointment(s) marked for rescheduling.`
        );
      } else {
        toast.success(editingTimeOffId ? 'Time off updated successfully' : 'Time off created successfully');
      }

      resetTimeOffForm();
      setTimeOffRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      console.error('Error saving time off:', error);
      toast.error(error.message || 'Failed to save time off');
    } finally {
      setTimeOffLoading(false);
    }
  };

  const handleEditTimeOff = (timeOff: any) => {
    setEditingTimeOffId(timeOff.id);
    setTimeOffType(timeOff.type);
    setTimeOffStartsAt(timeOff.startsAt.split('T')[0]);
    setTimeOffEndsAt(timeOff.endsAt.split('T')[0]);
    setTimeOffReason(timeOff.reason || '');
    setShowTimeOffForm(true);
  };

  const resetTimeOffForm = () => {
    setEditingTimeOffId(null);
    setTimeOffType('VACATION');
    setTimeOffStartsAt('');
    setTimeOffEndsAt('');
    setTimeOffReason('');
    setShowTimeOffForm(false);
  };

  const handleDeleteStaff = async () => {
    if (!staff) return;
    try {
      const result = await api.deleteStaff(staff.id);
      if (result.affectedAppointments > 0) {
        toast.success(
          `Staff member deleted. ${result.affectedAppointments} appointment(s) marked for rescheduling.`,
          { duration: 5000 }
        );
      } else {
        toast.success('Staff member deleted successfully');
      }
      navigate('/admin/staff');
    } catch (error: any) {
      console.error('Failed to delete staff:', error);
      toast.error(error.message || 'Failed to delete staff member');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!staff) return <div>Staff member not found</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="card-glass p-4 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <button
            onClick={() => navigate('/admin/staff')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Staff
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl md:text-3xl font-bold">{staff.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  {staff.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      staff.active
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {staff.active ? '✓ Active' : '○ Inactive'}
                  </span>
                  {staff._count && (
                    <span className="text-sm text-gray-600">
                      {staff._count.appointments} appointments
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Staff
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Member"
        itemName={staff.name}
        itemType="staff member"
        warningMessage="All future appointments with this staff member will be marked as 'Reschedule Pending' and staff will be unassigned."
      />

      {/* Tabs */}
      <div className="card-premium overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'info', label: 'Information', icon: '👤' },
              { id: 'services', label: 'Services', icon: '💅' },
              { id: 'hours', label: 'Working Hours', icon: '🕐' },
              { id: 'timeoff', label: 'Time Off', icon: '📅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600 bg-pink-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                {!editingInfo ? (
                  <button
                    onClick={() => setEditingInfo(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingInfo(false);
                        setName(staff.name);
                        setBio(staff.bio || '');
                        setActive(staff.active);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium shadow-lg"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editingInfo ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Brief bio or description"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activeStatus"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <label htmlFor="activeStatus" className="ml-2 text-sm text-gray-700">
                      Active (available for bookings)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Name</h3>
                    <p className="text-gray-900">{staff.name}</p>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio</h3>
                    <p className="text-gray-900">{staff.bio || 'No bio provided'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                    <p className="text-gray-900">{staff.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Assigned Services</h2>
                {!editingServices ? (
                  <button
                    onClick={() => setEditingServices(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingServices(false);
                        setSelectedServiceIds(staff.staffServices.map((ss) => ss.service.id));
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveServices}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium shadow-lg"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editingServices ? (
                <div className="space-y-2">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-pink-200 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          {service.category.name} • {service.durationMin} min • ₪{service.priceIls}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staff.staffServices.length > 0 ? (
                    staff.staffServices.map((ss) => (
                      <div
                        key={ss.service.id}
                        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-purple-200"
                      >
                        <h3 className="font-semibold text-gray-900 mb-1">{ss.service.name}</h3>
                        <p className="text-sm text-gray-600">
                          {ss.service.category.name} • {ss.service.durationMin} min • ₪{ss.service.priceIls}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      No services assigned yet
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Working Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Working Hours</h2>
                {!editingHours ? (
                  <button
                    onClick={() => setEditingHours(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingHours(false);
                        setWorkingHours(
                          staff.workingHours.map((wh) => ({
                            weekday: wh.weekday,
                            startHhmm: wh.startHhmm,
                            endHhmm: wh.endHhmm,
                          }))
                        );
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveWorkingHours}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium shadow-lg"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editingHours ? (
                <div className="space-y-3">
                  {workingHours.map((wh, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-pink-50/50 to-purple-50/50"
                    >
                      <select
                        value={wh.weekday}
                        onChange={(e) => updateWorkingHour(index, 'weekday', parseInt(e.target.value))}
                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        {WEEKDAYS.map((day, i) => (
                          <option key={i} value={i}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="time"
                          value={wh.startHhmm}
                          onChange={(e) => updateWorkingHour(index, 'startHhmm', e.target.value)}
                          className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={wh.endHhmm}
                          onChange={(e) => updateWorkingHour(index, 'endHhmm', e.target.value)}
                          className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      <button
                        onClick={() => removeWorkingHour(index)}
                        className="w-full sm:w-auto px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addWorkingHour}
                    className="w-full px-4 py-3 border-2 border-dashed border-pink-300 rounded-lg text-pink-600 hover:border-pink-500 hover:bg-pink-50 transition-colors font-medium"
                  >
                    + Add Working Hours
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {staff.workingHours.length > 0 ? (
                    staff.workingHours.map((wh) => (
                      <div
                        key={wh.id}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg"
                      >
                        <span className="font-semibold text-gray-900">{WEEKDAYS[wh.weekday]}</span>
                        <span className="text-gray-600">
                          {wh.startHhmm} - {wh.endHhmm}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">No working hours set</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Time Off Tab */}
          {activeTab === 'timeoff' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Time Off Periods</h2>
                {!showTimeOffForm && (
                  <button
                    onClick={() => setShowTimeOffForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium shadow-lg"
                  >
                    + Add Time Off
                  </button>
                )}
              </div>

              {showTimeOffForm ? (
                <form onSubmit={handleTimeOffSubmit} className="space-y-6 bg-white border-2 border-pink-200 rounded-lg p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTimeOffType('SICK_LEAVE')}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          timeOffType === 'SICK_LEAVE'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        🤒 Sick Leave
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeOffType('VACATION')}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          timeOffType === 'VACATION'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        🏖️ Vacation
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimeOffType('OTHER')}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          timeOffType === 'OTHER'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📋 Other
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={timeOffStartsAt}
                      onChange={(e) => setTimeOffStartsAt(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={timeOffEndsAt}
                      onChange={(e) => setTimeOffEndsAt(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={timeOffReason}
                      onChange={(e) => setTimeOffReason(e.target.value)}
                      rows={3}
                      placeholder="Add any additional notes..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetTimeOffForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      disabled={timeOffLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium shadow-lg disabled:opacity-50"
                      disabled={timeOffLoading}
                    >
                      {timeOffLoading
                        ? editingTimeOffId
                          ? 'Updating...'
                          : 'Creating...'
                        : editingTimeOffId
                        ? 'Update Time Off'
                        : 'Create Time Off'}
                    </button>
                  </div>
                </form>
              ) : (
                <TimeOffList
                  staffId={id!}
                  refreshTrigger={timeOffRefreshTrigger}
                  onEdit={handleEditTimeOff}
                  onDelete={() => setTimeOffRefreshTrigger((prev) => prev + 1)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
