const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Get locale from localStorage
    const localeStorage = localStorage.getItem('eliana-locale');
    let locale = 'en';
    try {
      if (localeStorage) {
        const parsed = JSON.parse(localeStorage);
        locale = parsed?.state?.locale || 'en';
      }
    } catch (e) {
      // Ignore parsing errors
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
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

  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
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

  async getAvailableSlots(params: { date: string; serviceId: string; staffId?: string; durationMin?: number }) {
    const query = new URLSearchParams();
    query.append('date', params.date);
    query.append('serviceId', params.serviceId);
    if (params.staffId) query.append('staffId', params.staffId);
    if (params.durationMin) query.append('durationMin', params.durationMin.toString());
    return this.request<{ available: boolean; slots: { time: string; available: boolean; reason?: 'booked' | 'insufficient_time' }[] }>(`/availability?${query.toString()}`);
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

  async updateAppointmentPrice(id: string, priceIls: number) {
    return this.request<any>(`/admin/appointments/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ priceIls }),
    });
  }

  async rescheduleAppointment(id: string, startsAt: string) {
    return this.request<any>(`/admin/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ startsAt }),
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

  // Time Off methods
  async getStaffTimeOffs(staffId: string) {
    return this.request<any[]>(`/staff/${staffId}/time-off`);
  }

  async createTimeOff(staffId: string, data: {
    type: string;
    startsAt: string;
    endsAt: string;
    reason?: string;
  }) {
    return this.request<any>(`/staff/${staffId}/time-off`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTimeOff(timeOffId: string, data: {
    type?: string;
    startsAt?: string;
    endsAt?: string;
    reason?: string;
  }) {
    return this.request<any>(`/staff/time-off/${timeOffId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTimeOff(timeOffId: string) {
    return this.request<any>(`/staff/time-off/${timeOffId}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async sendDirectMessage(data: {
    content: string;
    subject?: string;
    recipientId: string;
    appointmentId?: string;
  }) {
    return this.request<any>('/messages/direct', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'DIRECT' }),
    });
  }

  async sendBroadcastMessage(data: {
    content: string;
    subject?: string;
    recipientIds?: string[];
  }) {
    return this.request<any>('/messages/broadcast', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'BROADCAST' }),
    });
  }

  async getInbox() {
    return this.request<{ direct: any[]; broadcasts: any[] }>('/messages/inbox');
  }

  async getConversation(otherUserId: string) {
    return this.request<any[]>(`/messages/conversation/${otherUserId}`);
  }

  async markMessageAsRead(messageId: string) {
    return this.request<any>('/messages/read', {
      method: 'PATCH',
      body: JSON.stringify({ messageId }),
    });
  }

  async getUnreadCount() {
    return this.request<any>('/messages/unread-count');
  }

  async registerFcmToken(token: string) {
    return this.request<any>('/messages/fcm-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async deleteMessage(messageId: string) {
    return this.request<any>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async updateMessage(messageId: string, data: { subject?: string; content: string }) {
    return this.request<any>(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Database Management
  async backupDatabase(tables?: string[]) {
    return this.request<{ success: boolean; message: string; filename?: string }>('/admin/database/backup', {
      method: 'POST',
      body: JSON.stringify({ tables }),
    });
  }

  async restoreDatabase(tables?: string[]) {
    return this.request<{ success: boolean; message: string; restoredTables?: string[] }>('/admin/database/restore', {
      method: 'POST',
      body: JSON.stringify({ tables }),
    });
  }

  async getLastBackupDate() {
    return this.request<{ date: string | null }>('/admin/database/last-backup');
  }
}

export const api = new ApiClient();
