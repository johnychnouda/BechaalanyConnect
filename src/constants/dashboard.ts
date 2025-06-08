export const TRANSACTION_STATUS = {
  PURCHASED: 'Purchased',
  RECEIVED: 'Received',
} as const;

export const FILTER_OPTIONS = {
  ALL: 'all',
  PURCHASED: 'purchased',
  RECEIVED: 'received',
} as const;

export const COLORS = {
  PRIMARY: '#E73828',
  SUCCESS: '#5FD568',
  WARNING: '#FB923C',
  TEXT: {
    PRIMARY: '#070707',
    SECONDARY: '#8E8E8E',
  },
} as const;

export const BREAKPOINTS = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const; 