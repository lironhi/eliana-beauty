import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { exportToCSV, exportToPDF, formatClientsForExport } from '@/lib/export';
import { Pagination } from '@/components/Pagination';
import EditClientModal from '@/components/admin/EditClientModal';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);

  useEffect(() => {
    loadClients();
  }, [currentPage]);

  const loadClients = async () => {
    try {
      const data = await api.getAllClients(currentPage, 10);
      setClients(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const result = await api.deleteClient(clientToDelete.id);
      if (result.affectedAppointments > 0) {
        toast.success(
          `Client deleted. ${result.affectedAppointments} appointment(s) marked as cancelled.`,
          { duration: 5000 }
        );
      } else {
        toast.success('Client deleted successfully');
      }
      loadClients();
    } catch (error: any) {
      console.error('Failed to delete client:', error);
      toast.error(error.message || 'Failed to delete client');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleExportCSV = () => {
    const data = formatClientsForExport(filteredClients);
    const filename = `clients-${new Date().toISOString().split('T')[0]}`;
    exportToCSV(data, filename);
  };

  const handleExportPDF = () => {
    const data = formatClientsForExport(filteredClients);
    const filename = `clients-${new Date().toISOString().split('T')[0]}`;
    exportToPDF(data, filename);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search & Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:gap-4 mb-4">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full text-sm md:text-base"
            />
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={handleExportCSV}
              className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
              title="Export to CSV"
            >
              📊 <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
              title="Export to PDF"
            >
              📄 <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 justify-center md:justify-end">
          <div className="text-center px-4 md:px-6 py-2 md:py-3 bg-primary-50 rounded-lg flex-1 md:flex-none">
            <p className="text-xs md:text-sm text-primary-600 font-medium">Total</p>
            <p className="text-xl md:text-2xl font-bold text-primary-700">{clients.length}</p>
          </div>
          <div className="text-center px-4 md:px-6 py-2 md:py-3 bg-green-50 rounded-lg flex-1 md:flex-none">
            <p className="text-xs md:text-sm text-green-600 font-medium">Active</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">
              {clients.filter((c) => c.active).length}
            </p>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
          >
            {/* Client Header */}
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-base md:text-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{client.name}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      client.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {client.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-gray-400 flex-shrink-0">📧</span>
                <span className="text-gray-700 truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="text-gray-400 flex-shrink-0">📱</span>
                  <span className="text-gray-700">{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-gray-400 flex-shrink-0">🌐</span>
                <span className="text-gray-700">{client.locale.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-gray-400 flex-shrink-0">📅</span>
                <span className="text-gray-700">
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Appointments Summary */}
            <div className="border-t border-gray-200 pt-3 md:pt-4 mb-3">
              <p className="text-xs md:text-sm font-medium text-gray-700 mb-2">
                Appointments ({client.appointments.length})
              </p>
              {client.appointments.length > 0 ? (
                <div className="space-y-1">
                  {client.appointments.slice(0, 3).map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between text-xs text-gray-600"
                    >
                      <span className="truncate mr-2">{new Date(apt.startsAt).toLocaleDateString()}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs flex-shrink-0 ${
                          apt.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : apt.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No appointments yet</p>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedClient(client);
                  setShowEditModal(true);
                }}
                className="flex-1 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => {
                  setClientToDelete(client);
                  setShowDeleteModal(true);
                }}
                className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs md:text-sm font-medium border border-red-200"
                title="Delete client"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center text-gray-500 text-sm md:text-base">
          {searchTerm
            ? 'No clients found matching your search'
            : 'No clients registered yet'}
        </div>
      )}

      {filteredClients.length > 0 && !searchTerm && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Edit Client Modal */}
      {selectedClient && (
        <EditClientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          onSuccess={loadClients}
        />
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setClientToDelete(null);
          }}
          onConfirm={handleDeleteClient}
          title="Delete Client"
          itemName={clientToDelete.name}
          itemType="client"
          warningMessage="All future appointments for this client will be marked as cancelled. This action cannot be undone."
        />
      )}
    </div>
  );
}
