import api from '@/lib/api';
import type {
  User,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  UserRole,
} from '@/types/api.types';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface UpdateUserData {
  name?: string;
  email?: string;
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

  async toggleStatus(id: string): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`);
    return response.data.data;
  },
};

export default usersService;
