import api, { setTokens, clearTokens, getRefreshToken } from '@/lib/api';
import type {
  User,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  ApiResponse,
} from '@/types/api.types';

export const authService = {
  /** Login user with email and password */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>('/auth/login', credentials);
    const { user, tokens } = response.data.data;
    setTokens(tokens.accessToken, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  /** Register a new user — backend requires firstName + lastName, not name */
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>('/auth/register', data);
    const { user, tokens } = response.data.data;
    setTokens(tokens.accessToken, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  /** Logout current user */
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      clearTokens();
    }
  },

  /** Get current authenticated user */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Change password — backend requires currentPassword, newPassword, AND confirmPassword
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword });
  },

  /** Request password reset email */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token — backend requires token, password, confirmPassword
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password, confirmPassword });
  },

  /** Refresh access token */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    setTokens(accessToken, newRefreshToken);
    return response.data.data;
  },
};

export default authService;
