const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options?.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Send cookies with requests
    });

    // If we get a 401, try to refresh the token
    if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the original request with new token
        const retryHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
          ...options?.headers,
        };
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(error.message || 'Request failed');
        }

        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; name: string; phone?: string; locale?: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Services
  async getServices() {
    return this.request<any[]>('/services/public');
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  // Staff
  async getStaff(serviceId?: string) {
    const query = serviceId ? `?serviceId=${serviceId}` : '';
    return this.request<any[]>(`/staff/public${query}`);
  }

  // Availability
  async getAvailability(staffId: string, date: string) {
    return this.request<any>(`/availability?staffId=${staffId}&date=${date}`);
  }

  async getAvailableSlots(params: { date: string; serviceId: string; staffId?: string }) {
    const query = new URLSearchParams();
    query.append('date', params.date);
    query.append('serviceId', params.serviceId);
    if (params.staffId) query.append('staffId', params.staffId);
    return this.request<string[]>(`/availability?${query.toString()}`);
  }

  // Appointments
  async createAppointment(data: {
    serviceId: string;
    staffId?: string;
    startsAt: string;
    notes?: string;
  }) {
    return this.request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyAppointments() {
    return this.request<any[]>('/appointments');
  }

  async cancelAppointment(id: string) {
    return this.request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async getHealth() {
    return this.request<any>('/health');
  }

  // Admin endpoints
  async getDashboardStats() {
    return this.request<any>('/admin/dashboard');
  }

  async getAllAppointments(filters?: { status?: string; staffId?: string; date?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/appointments${query}`);
  }

  async updateAppointmentStatus(id: string, status: string) {
    return this.request<any>(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAppointment(id: string) {
    return this.request<{ message: string }>(`/admin/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllClients(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/clients${query}`);
  }

  async updateClient(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    locale?: string;
    active?: boolean;
  }) {
    return this.request<any>(`/admin/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string) {
    return this.request<{ message: string; affectedAppointments: number }>(`/admin/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Services Management
  async getAllServices(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/services/admin/all${query}`);
  }

  async createService(data: {
    name: string;
    description?: string;
    categoryId: string;
    durationMin: number;
    priceIls: number;
    imageUrl?: string;
    active?: boolean;
  }) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: {
    name?: string;
    description?: string;
    categoryId?: string;
    durationMin?: number;
    priceIls?: number;
    imageUrl?: string;
    active?: boolean;
  }) {
    return this.request<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Categories Management
  async getAllCategories() {
    return this.request<any[]>('/services/categories/all');
  }

  async createCategory(data: {
    name: string;
    slug: string;
    imageUrl?: string;
    order?: number;
    active?: boolean;
  }) {
    return this.request<any>('/services/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: {
    name?: string;
    slug?: string;
    imageUrl?: string;
    order?: number;
    active?: boolean;
  }) {
    return this.request<any>(`/services/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/services/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Staff Management
  async getAllStaff(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/staff/admin/all${query}`);
  }

  async createStaff(data: {
    name: string;
    bio?: string;
    active?: boolean;
  }) {
    return this.request<any>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStaff(id: string, data: {
    name?: string;
    bio?: string;
    active?: boolean;
  }) {
    return this.request<any>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStaff(id: string) {
    return this.request<{ message: string }>(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStaffServices(id: string, serviceIds: string[]) {
    return this.request<any>(`/staff/${id}/services`, {
      method: 'PUT',
      body: JSON.stringify({ serviceIds }),
    });
  }

  async updateStaffWorkingHours(id: string, workingHours: Array<{
    weekday: number;
    startHhmm: string;
    endHhmm: string;
  }>) {
    return this.request<any>(`/staff/${id}/working-hours`, {
      method: 'PUT',
      body: JSON.stringify({ workingHours }),
    });
  }
}

export const api = new ApiClient();
