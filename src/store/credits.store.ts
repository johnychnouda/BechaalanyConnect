import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface CreditsState {
  balance: number;
  isUpdating: boolean;
  lastUpdated: number;
  pendingRequests: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number;
  }>;
}

interface CreditsStore extends CreditsState {
  // Actions
  setBalance: (balance: number) => void;
  updateBalance: (amount: number) => void;
  setUpdating: (isUpdating: boolean) => void;
  addPendingRequest: (request: { id: string; amount: number }) => void;
  approvePendingRequest: (requestId: string) => void;
  rejectPendingRequest: (requestId: string) => void;
  initializeFromUser: (userBalance: number) => void;
  
  // Computed
  getTotalPendingAmount: () => number;
  getProjectedBalance: () => number;
}

export const useCreditsStore = create<CreditsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    balance: 0,
    isUpdating: false,
    lastUpdated: 0,
    pendingRequests: [],

    // Actions
    setBalance: (balance: number) => 
      set({ 
        balance, 
        lastUpdated: Date.now(),
        isUpdating: false 
      }),

    updateBalance: (amount: number) => 
      set((state) => ({ 
        balance: state.balance + amount,
        lastUpdated: Date.now(),
        isUpdating: false 
      })),

    setUpdating: (isUpdating: boolean) => 
      set({ isUpdating }),

    addPendingRequest: (request: { id: string; amount: number }) =>
      set((state) => ({
        pendingRequests: [
          ...state.pendingRequests,
          {
            ...request,
            status: 'pending' as const,
            createdAt: Date.now(),
          },
        ],
      })),

    approvePendingRequest: (requestId: string) =>
      set((state) => {
        const request = state.pendingRequests.find((r) => r.id === requestId);
        if (!request) return state;

        return {
          balance: state.balance + request.amount,
          lastUpdated: Date.now(),
          pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
        };
      }),

    rejectPendingRequest: (requestId: string) =>
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
      })),

    initializeFromUser: (userBalance: number) =>
      set({
        balance: userBalance,
        lastUpdated: Date.now(),
        isUpdating: false,
      }),

    // Computed values
    getTotalPendingAmount: () => {
      const { pendingRequests } = get();
      return pendingRequests
        .filter((r) => r.status === 'pending')
        .reduce((sum, r) => sum + r.amount, 0);
    },

    getProjectedBalance: () => {
      const { balance, getTotalPendingAmount } = get();
      return balance + getTotalPendingAmount();
    },
  }))
);

// Export hooks for common use cases
export const useCreditsBalance = () => useCreditsStore((state) => state.balance);
export const useIsCreditsUpdating = () => useCreditsStore((state) => state.isUpdating);
export const usePendingCredits = () => useCreditsStore((state) => state.pendingRequests);
export const useProjectedBalance = () => useCreditsStore((state) => state.getProjectedBalance());
