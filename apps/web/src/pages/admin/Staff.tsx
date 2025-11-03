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
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
              title="Export to CSV"
            >
              📊 <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
              title="Export to PDF"
            >
              📄 <span className="hidden sm:inline">PDF</span>
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
          <div key={member.id} className="card-premium hover-lift group" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-gradient transition-all truncate">
                  {member.name}
                </h3>
                {member.bio && <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{member.bio}</p>}
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ml-2 ${
                  member.active
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {member.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-gray-700">Services</span>
                <button
                  onClick={() => handleManageServices(member)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {member.staffServices.length > 0 ? (
                  member.staffServices.map((ss) => (
                    <span
                      key={ss.service.id}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border border-purple-200"
                    >
                      {ss.service.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs md:text-sm text-gray-400">No services assigned</span>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-medium text-gray-700">Working Hours</span>
                <button
                  onClick={() => handleManageWorkingHours(member)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
              <div className="text-xs md:text-sm text-gray-600 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3">
                {member.workingHours.length > 0 ? (
                  <div className="space-y-1">
                    {member.workingHours.slice(0, 3).map((wh) => (
                      <div key={wh.id} className="flex justify-between">
                        <span className="font-medium">{WEEKDAYS[wh.weekday]}</span>
                        <span className="text-gray-500">{wh.startHhmm} - {wh.endHhmm}</span>
                      </div>
                    ))}
                    {member.workingHours.length > 3 && (
                      <div className="text-xs text-gray-400 mt-1">
                        +{member.workingHours.length - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">No hours set</span>
                )}
              </div>
            </div>

            {/* Stats */}
            {member._count && (
              <div className="mb-4 pt-4 border-t border-gray-200">
                <div className="text-xs md:text-sm text-gray-600">
                  <span className="font-bold text-gradient text-base md:text-lg">{member._count.appointments}</span> total appointments
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/staff/${member.id}`)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-xs md:text-sm font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs md:text-sm font-medium border border-red-200"
                title="Delete staff member"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
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
