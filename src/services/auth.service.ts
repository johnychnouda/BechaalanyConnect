import api from '@/utils/api';
import { AxiosError } from 'axios';

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  username: string;
  country: string;
  userType: string;
  storeName?: string;
  location?: string;
  password: string;
  confirmPassword: string;
  isBusiness: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private tokenKey = 'token';
  private userKey = 'user';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      this.setAuthData(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      this.setAuthData(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async verifyEmail(code: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { code });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async resendVerificationCode(): Promise<void> {
    try {
      await api.post('/auth/resend-verification');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  public getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setAuthData(data: AuthResponse): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError && error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('An unexpected error occurred');
  }
}

export const authService = AuthService.getInstance(); 