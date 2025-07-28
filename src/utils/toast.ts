import { toast } from 'react-toastify';

// Success toast
export const showSuccess = (message: string) => {
  toast.success(message);
};

// Error toast
export const showError = (message: string) => {
  toast.error(message);
};

// Warning toast
export const showWarning = (message: string) => {
  toast.warning(message);
};

// Info toast
export const showInfo = (message: string) => {
  toast.info(message);
};

// Loading toast
export const showLoading = (message: string) => {
  return toast.loading(message);
};

// Dismiss toast
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

// Update toast
export const updateToast = (toastId: string | number, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
  });
}; 