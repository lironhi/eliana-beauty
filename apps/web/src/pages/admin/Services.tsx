import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { exportToCSV, exportToPDF, formatServicesForExport } from '../../lib/export';
import { Pagination } from '../../components/Pagination';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  order: number;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceIls: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: string;
  category: Category;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Service modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    durationMin: 30,
    priceIls: 0,
    imageUrl: '',
    active: true,
  });

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    order: 0,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        api.getAllServices(currentPage, 10),
        api.getAllCategories(),
      ]);
      setServices(servicesData.data);
      setPagination(servicesData.pagination);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.message || 'Failed to load data');
    } finally{
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Service handlers
  const handleCreateService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      durationMin: 30,
      priceIls: 0,
      imageUrl: '',
      active: true,
    });
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      categoryId: service.categoryId,
      durationMin: service.durationMin,
      priceIls: service.priceIls,
      imageUrl: service.imageUrl || '',
      active: service.active,
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await api.updateService(editingService.id, serviceForm);
        toast.success('Service updated successfully');
      } else {
        await api.createService(serviceForm);
        toast.success('Service created successfully');
      }
      setShowServiceModal(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to save service:', error);
      toast.error(error.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      toast.success('Service deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete service:', error);
      toast.error(error.message || 'Failed to delete service');
    }
  };

  // Category handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      imageUrl: '',
      order: categories.length,
      active: true,
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl || '',
      order: category.order,
      active: category.active,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await api.createCategory(categoryForm);
        toast.success('Category created successfully');
      }
      setShowCategoryModal(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All services in this category will need to be reassigned.')) return;
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error.message || 'Failed to delete category. Make sure there are no services in this category.');
    }
  };

  const handleExportCSV = () => {
    const data = formatServicesForExport(services);
    const filename = `services-${new Date().toISOString().split('T')[0]}`;
    exportToCSV(data, filename);
  };

  const handleExportPDF = () => {
    const data = formatServicesForExport(services);
    const filename = `services-${new Date().toISOString().split('T')[0]}`;
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Services & <span className="text-gradient">Categories</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600">Manage your services, categories, and pricing</p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-premium p-2">
        <nav className="flex gap-2">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Services ({pagination.total})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Categories ({categories.length})
          </button>
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleCreateService}
              className="px-4 py-2 btn-primary transition-all hover:shadow-lg"
            >
              + Add Service
            </button>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Service</th>
                    <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Category</th>
                    <th className="hidden sm:table-cell text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Duration</th>
                    <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Price</th>
                    <th className="hidden md:table-cell text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-purple-50/30 transition-all">
                      <td className="py-3 px-3 md:px-4">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm md:text-base truncate">{service.name}</div>
                          {service.description && (
                            <div className="text-xs md:text-sm text-gray-500 line-clamp-1">{service.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 md:px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border border-purple-200">
                          {service.category.name}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell py-3 px-3 md:px-4 text-gray-700 text-sm md:text-base">{service.durationMin} min</td>
                      <td className="py-3 px-3 md:px-4 text-gray-900 font-medium text-sm md:text-base">₪{service.priceIls}</td>
                      <td className="hidden md:table-cell py-3 px-3 md:px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.active
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 md:px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-800 text-xs md:text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {services.length === 0 && (
              <div className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <span className="text-3xl">💅</span>
                </div>
                <p className="text-gray-500 text-sm md:text-base">
                  No services yet. Create your first service!
                </p>
              </div>
            )}
            {services.length > 0 && (
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

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2 btn-primary transition-all hover:shadow-lg"
            >
              + Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="card-premium hover-lift group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate group-hover:text-gradient transition-all">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">/{category.slug}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      category.active
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {category.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {category.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-gradient-to-br from-pink-100 to-purple-100">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-4 px-3 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                  <span className="font-medium">Order: {category.order}</span>
                  <span className="font-medium">{services.filter(s => s.categoryId === category.id).length} services</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs md:text-sm font-medium border border-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs md:text-sm font-medium border border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {categories.length === 0 && (
            <div className="card-premium p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <span className="text-3xl">📂</span>
              </div>
              <p className="text-gray-500 text-sm md:text-base">
                No categories yet. Create your first category!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Classic Manicure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={serviceForm.categoryId}
                  onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={serviceForm.durationMin}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMin: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₪) *</label>
                  <input
                    type="number"
                    value={serviceForm.priceIls}
                    onChange={(e) => setServiceForm({ ...serviceForm, priceIls: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={serviceForm.imageUrl}
                  onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="serviceActive"
                  checked={serviceForm.active}
                  onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="serviceActive" className="ml-2 text-sm text-gray-700">
                  Active (visible to clients)
                </label>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 bg-gray-50">
              <button
                onClick={() => setShowServiceModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="px-4 py-2 btn-primary transition-all hover:shadow-lg text-sm md:text-base"
              >
                {editingService ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-premium max-w-lg w-full animate-scaleIn shadow-2xl">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Nails"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="nails (lowercase, no spaces)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order *</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={categoryForm.active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="categoryActive" className="ml-2 text-sm text-gray-700">
                  Active (visible to clients)
                </label>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 bg-gray-50">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 btn-primary transition-all hover:shadow-lg text-sm md:text-base"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
