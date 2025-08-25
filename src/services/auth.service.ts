import api from '@/utils/api';
import { signIn, signOut, getSession } from 'next-auth/react';

export interface LoginCredentials {
  email: string;
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
  lang?: string;
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

export interface RegisterResponse {
  message: string;
  verification_token: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials, lang?: string): Promise<AuthResponse> {
    try {
      // Use NextAuth signIn for login
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        lang: lang || 'en',
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Get the session to return user and token info
      const session = await getSession();
      if (!session) {
        throw new Error('Failed to get session after login');
      }
      
      return {
        token: session.laravelToken as string,
        user: {
          id: session.user.id,
          email: session.user.email,
          username: session.user.name,
          role: session.user.role,
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      // Transform data to match Laravel backend expectations
      const registerData = {
        email: data.email,
        phone: data.phone,
        username: data.username,
        country: data.country,
        userType: data.userType,
        storeName: data.storeName,
        location: data.location,
        password: data.password,
        password_confirmation: data.confirmPassword, // Map confirmPassword to password_confirmation
        isBusiness: data.isBusiness,
        lang: data.lang || 'en'
      };
      
      // Register via API - this returns verification token, not session token
      const response = await api.post<RegisterResponse>('/register', registerData);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async verifyEmail(code: string, email: string, token: string): Promise<void> {
    try {
      await api.post('/verify-email', { code, email, token });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async resendVerificationCode(email: string, lang?: string): Promise<void> {
    try {
      await api.post('/resend-verification-code', { email, lang });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async logout(locale: string = 'en'): Promise<void> {
    try {
      // Call Laravel logout endpoint first if we have a token
      const session = await getSession();
      if (session?.laravelToken) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${locale}/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.laravelToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          // Continue with NextAuth logout even if Laravel logout fails
          console.warn('Laravel logout failed:', error);
        }
      }
      
      // Use NextAuth signOut for logout
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleError(error);
    }
  }

  public async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const session = await getSession();
    return session?.laravelToken || null;
  }

  public async getUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const session = await getSession();
    if (!session?.user) return null;
    
    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.name,
      role: session.user.role,
    };
  }

  public async isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return !!session;
  }

  private handleError(error: unknown): Error {
    if (error) {
      return new Error(error as string);
    }
    return new Error('An unexpected error occurred');
  }
}

export const authService = AuthService.getInstance(); 