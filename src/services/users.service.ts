import api from '@/lib/api';
import type {
  User,
  UserRole,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from '@/types/api.types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;    // backend requires firstName (not name)
  lastName: string;     // backend requires lastName (not name)
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const usersService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>(`/users${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  /**
   * Toggle user active status.
   * Backend PATCH /users/:id/status expects { isActive: boolean }
   */
  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { isActive });
    return response.data.data;
  },
};

export default usersService;
