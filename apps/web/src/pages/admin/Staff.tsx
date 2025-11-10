import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { exportToCSV, exportToPDF, formatStaffForExport } from '../../lib/export';
import { Pagination } from '../../components/Pagination';
import TimeOffModal from '../../components/admin/TimeOffModal';
import TimeOffList from '../../components/admin/TimeOffList';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

interface Service {
  id: string;
  name: string;
  category: { name: string };
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

export default function Staff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    bio: '',
    active: true,
  });

  // Services modal state
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedStaffForServices, setSelectedStaffForServices] = useState<StaffMember | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Working hours modal state
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [selectedStaffForHours, setSelectedStaffForHours] = useState<StaffMember | null>(null);
  const [workingHours, setWorkingHours] = useState<Array<{ weekday: number; startHhmm: string; endHhmm: string }>>([]);

  // Time off modal state
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [selectedStaffForTimeOff, setSelectedStaffForTimeOff] = useState<StaffMember | null>(null);
  const [timeOffRefreshTrigger, setTimeOffRefreshTrigger] = useState(0);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, servicesData] = await Promise.all([
        api.getAllStaff(currentPage, 10),
        api.getAllServices(),
      ]);
      setStaff(staffData.data);
      setPagination(staffData.pagination);
      setServices(servicesData.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Staff CRUD handlers
  const handleCreateStaff = () => {
    setEditingStaff(null);
    setStaffForm({ name: '', bio: '', active: true });
    setShowStaffModal(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      bio: member.bio || '',
      active: member.active,
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async () => {
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, staffForm);
        toast.success('Staff member updated successfully');
      } else {
        await api.createStaff(staffForm);
        toast.success('Staff member created successfully');
      }
      setShowStaffModal(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to save staff:', error);
      toast.error(error.message || 'Failed to save staff member');
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      const result = await api.deleteStaff(staffToDelete.id);
      if (result.affectedAppointments > 0) {
        toast.success(
          `Staff member deleted. ${result.affectedAppointments} appointment(s) marked for rescheduling.`,
          { duration: 5000 }
        );
      } else {
        toast.success('Staff member deleted successfully');
      }
      loadData();
    } catch (error: any) {
      console.error('Failed to delete staff:', error);
      toast.error(error.message || 'Failed to delete staff member');
    }
  };

  // Services assignment handlers
  const handleManageServices = (member: StaffMember) => {
    setSelectedStaffForServices(member);
    setSelectedServiceIds(member.staffServices.map(ss => ss.service.id));
    setShowServicesModal(true);
  };

  const handleSaveServices = async () => {
    if (!selectedStaffForServices) return;
    try {
      await api.updateStaffServices(selectedStaffForServices.id, selectedServiceIds);
      toast.success('Services updated successfully');
      setShowServicesModal(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to update services:', error);
      toast.error(error.message || 'Failed to update services');
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Working hours handlers
  const handleManageWorkingHours = (member: StaffMember) => {
    setSelectedStaffForHours(member);
    setWorkingHours(member.workingHours.map(wh => ({
      weekday: wh.weekday,
      startHhmm: wh.startHhmm,
      endHhmm: wh.endHhmm,
    })));
    setShowWorkingHoursModal(true);
  };

  const handleSaveWorkingHours = async () => {
    if (!selectedStaffForHours) return;
    try {
      await api.updateStaffWorkingHours(selectedStaffForHours.id, workingHours);
      toast.success('Working hours updated successfully');
      setShowWorkingHoursModal(false);
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

  const handleExportCSV = () => {
    const data = formatStaffForExport(staff);
    const filename = `staff-${new Date().toISOString().split('T')[0]}`;
    exportToCSV(data, filename);
  };

  const handleExportPDF = () => {
    const data = formatStaffForExport(staff);
    const filename = `staff-${new Date().toISOString().split('T')[0]}`;
    exportToPDF(data, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="card-glass p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Staff <span className="text-gradient">Management</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600">Manage staff members, services, and working hours</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              title="Export to CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              title="Export to PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={handleCreateStaff}
              className="w-full sm:w-auto px-4 py-2 btn-primary transition-all hover:shadow-lg text-sm"
            >
              + Add Staff Member
            </button>
          </div>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {staff.map((member, index) => (
          <div key={member.id} className="card-premium hover-lift group overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
            {/* Staff Header with Gradient Background */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white shadow-xl">
                    <span className="text-2xl font-bold">
                      {member.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      member.active
                        ? 'bg-green-500/90 text-white border-2 border-white/50'
                        : 'bg-gray-500/90 text-white border-2 border-white/50'
                    }`}
                  >
                    {member.active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                  {member.name}
                </h3>
                {member.bio && (
                  <p className="text-sm text-white/90 line-clamp-2 drop-shadow">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">

              {/* Services */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Services</span>
                  </div>
                  <button
                    onClick={() => handleManageServices(member)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-all border border-blue-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.staffServices.length > 0 ? (
                    member.staffServices.map((ss) => (
                      <span
                        key={ss.service.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border border-purple-200 hover:shadow-sm transition-shadow"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {ss.service.name}
                      </span>
                    ))
                  ) : (
                    <div className="w-full py-3 text-center text-sm text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      No services assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Working Hours</span>
                  </div>
                  <button
                    onClick={() => handleManageWorkingHours(member)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-all border border-blue-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  {member.workingHours.length > 0 ? (
                    <div className="space-y-2">
                      {member.workingHours.slice(0, 3).map((wh) => (
                        <div key={wh.id} className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {WEEKDAYS[wh.weekday]}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">{wh.startHhmm} - {wh.endHhmm}</span>
                        </div>
                      ))}
                      {member.workingHours.length > 3 && (
                        <div className="text-xs text-gray-500 text-center pt-1 font-medium">
                          +{member.workingHours.length - 3} more days
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-sm text-gray-400 bg-white/60 rounded-lg">
                      No hours set
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              {member._count && (
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Total Appointments</p>
                          <p className="text-2xl font-bold text-gradient">{member._count.appointments}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/staff/${member.id}`)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStaffToDelete(member);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold border border-red-200 hover:border-red-300 hover:shadow-md"
                  title="Delete staff member"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setStaffToDelete(null);
          }}
          onConfirm={handleDeleteStaff}
          title="Delete Staff Member"
          itemName={staffToDelete.name}
          itemType="staff member"
          warningMessage="All future appointments with this staff member will be marked as 'Reschedule Pending' and staff will be unassigned."
        />
      )}

      {staff.length === 0 && (
        <div className="card-premium p-8 md:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-gray-500 text-sm md:text-base">No staff members yet. Add your first one!</p>
        </div>
      )}

      {staff.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-premium max-w-lg w-full animate-scaleIn shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Eliana"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={staffForm.bio}
                  onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief bio or description"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="staffActive"
                  checked={staffForm.active}
                  onChange={(e) => setStaffForm({ ...staffForm, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="staffActive" className="ml-2 text-sm text-gray-700">
                  Active (available for bookings)
                </label>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 bg-gray-50">
              <button
                onClick={() => setShowStaffModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaff}
                className="px-4 py-2 btn-primary transition-all hover:shadow-lg text-sm md:text-base"
              >
                {editingStaff ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Modal */}
      {showServicesModal && selectedStaffForServices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Manage Services for {selectedStaffForServices.name}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Select which services this staff member can provide</p>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-pink-200 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm md:text-base truncate">{service.name}</div>
                      <div className="text-xs md:text-sm text-gray-500 truncate">
                        {service.category.name} • {service.durationMin} min • ₪{service.priceIls}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 bg-gray-50">
              <button
                onClick={() => setShowServicesModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServices}
                className="px-4 py-2 btn-primary transition-all hover:shadow-lg text-sm md:text-base"
              >
                Save Services
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Working Hours Modal */}
      {showWorkingHoursModal && selectedStaffForHours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Working Hours for {selectedStaffForHours.name}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Define the working schedule</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {workingHours.map((wh, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-pink-50/50 to-purple-50/50">
                    <select
                      value={wh.weekday}
                      onChange={(e) => updateWorkingHour(index, 'weekday', parseInt(e.target.value))}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                    >
                      {WEEKDAYS.map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="time"
                        value={wh.startHhmm}
                        onChange={(e) => updateWorkingHour(index, 'startHhmm', e.target.value)}
                        className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        value={wh.endHhmm}
                        onChange={(e) => updateWorkingHour(index, 'endHhmm', e.target.value)}
                        className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeWorkingHour(index)}
                      className="w-full sm:w-auto px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm border border-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addWorkingHour}
                  className="w-full px-4 py-3 border-2 border-dashed border-pink-300 rounded-lg text-pink-600 hover:border-pink-500 hover:bg-pink-50 transition-colors font-medium text-sm"
                >
                  + Add Working Hours
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 bg-gray-50">
              <button
                onClick={() => setShowWorkingHoursModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkingHours}
                className="px-4 py-2 btn-primary transition-all hover:shadow-lg text-sm md:text-base"
              >
                Save Working Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Off Modal */}
      {showTimeOffModal && selectedStaffForTimeOff && (
        <TimeOffModal
          isOpen={showTimeOffModal}
          onClose={() => {
            setShowTimeOffModal(false);
            setSelectedStaffForTimeOff(null);
          }}
          staffId={selectedStaffForTimeOff.id}
          staffName={selectedStaffForTimeOff.name}
          onSuccess={() => {
            setTimeOffRefreshTrigger((prev) => prev + 1);
            loadData();
          }}
        />
      )}
    </div>
  );
}
