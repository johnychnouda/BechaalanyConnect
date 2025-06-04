import { create } from "zustand";

type AppMobileMenuStore = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  set: (newVal: boolean) => void;
};

export const useAppMobileMenuStore = create<AppMobileMenuStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  set: (newVal) => set({ isOpen: newVal }),
}));
