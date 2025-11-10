import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { exportToCSV, exportToPDF, formatServicesForExport } from '../../lib/export';
import { Pagination } from '../../components/Pagination';

interface Category {
  id: string;
  name: string;
  nameHe?: string;
  description?: string;
  descriptionHe?: string;
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

type ViewMode = 'cards' | 'table';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
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
    nameHe: '',
    description: '',
    descriptionHe: '',
    categoryId: '',
    durationMin: 30,
    priceIls: 0,
    priceFrom: false,
    imageUrl: '',
    active: true,
  });

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameHe: '',
    description: '',
    descriptionHe: '',
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
      nameHe: '',
      description: '',
      descriptionHe: '',
      categoryId: categories[0]?.id || '',
      durationMin: 30,
      priceIls: 0,
      priceFrom: false,
      imageUrl: '',
      active: true,
    });
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      nameHe: (service as any).nameHe || '',
      description: service.description || '',
      descriptionHe: (service as any).descriptionHe || '',
      categoryId: service.categoryId,
      durationMin: service.durationMin,
      priceIls: service.priceIls,
      priceFrom: (service as any).priceFrom || false,
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
      nameHe: '',
      description: '',
      descriptionHe: '',
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
      nameHe: category.nameHe || '',
      description: category.description || '',
      descriptionHe: category.descriptionHe || '',
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
          <div className="flex justify-between items-center">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Card view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Table view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleCreateService}
              className="px-4 py-2 btn-primary transition-all hover:shadow-lg"
            >
              + Add Service
            </button>
          </div>

          {viewMode === 'table' ? (
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
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all text-xs md:text-sm font-medium border border-blue-200 hover:border-blue-300"
                            title="Edit service"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden md:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all text-xs md:text-sm font-medium border border-red-200 hover:border-red-300"
                            title="Delete service"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden md:inline">Delete</span>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="card-premium hover-lift group overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Service Image */}
                  <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-pink-100 to-purple-100">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">💅</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                          service.active
                            ? 'bg-green-500/90 text-white border border-green-300'
                            : 'bg-gray-500/90 text-white border border-gray-300'
                        }`}
                      >
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gradient transition-all">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border border-purple-200">
                        {service.category.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {service.durationMin} min
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gradient">
                        ₪{service.priceIls}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all text-sm font-medium border border-blue-200 hover:border-blue-300 hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all text-sm font-medium border border-red-200 hover:border-red-300 hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-full p-8 md:p-12 text-center card-premium">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <span className="text-3xl">💅</span>
                  </div>
                  <p className="text-gray-500 text-sm md:text-base">
                    No services yet. Create your first service!
                  </p>
                </div>
              )}
            </div>
          )}
          {services.length > 0 && viewMode === 'cards' && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Classic Manicure"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם (עברית)
                  </label>
                  <input
                    type="text"
                    value={serviceForm.nameHe}
                    onChange={(e) => setServiceForm({ ...serviceForm, nameHe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="לדוגמה: מניקור קלאסי"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of the service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תיאור (עברית)
                  </label>
                  <textarea
                    value={serviceForm.descriptionHe}
                    onChange={(e) => setServiceForm({ ...serviceForm, descriptionHe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="תיאור קצר של השירות"
                    dir="rtl"
                  />
                </div>
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="servicePriceFrom"
                  checked={serviceForm.priceFrom}
                  onChange={(e) => setServiceForm({ ...serviceForm, priceFrom: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="servicePriceFrom" className="ml-2 text-sm text-gray-700">
                  Display "from" before price (for variable pricing)
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Nails"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם (עברית)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.nameHe}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameHe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="לדוגמה: ציפורניים"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Professional nail care services"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תיאור (עברית)
                  </label>
                  <textarea
                    value={categoryForm.descriptionHe}
                    onChange={(e) => setCategoryForm({ ...categoryForm, descriptionHe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="לדוגמה: שירותי טיפוח ציפורניים מקצועיים"
                    rows={3}
                    dir="rtl"
                  />
                </div>
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
