import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthService from '@/services/auth-service';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await AuthService.login(email, password);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await AuthService.register(email, password, name);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Registration failed", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        AuthService.logout();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.forgotPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Password reset request failed", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.resetPassword(token, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Password reset failed", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("No authenticated user");
          }
          
          const updatedUser = await AuthService.updateProfile(userData);
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Profile update failed", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'pecklet-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);