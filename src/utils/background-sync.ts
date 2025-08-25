/**
 * Background synchronization utility for credits balance
 * Uses Service Worker for efficient background updates
 */

interface BackgroundSyncMessage {
  type: 'CREDITS_UPDATE';
  balance: number;
  timestamp: number;
}

class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private listeners: ((balance: number) => void)[] = [];

  public static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  /**
   * Initialize background sync
   */
  public async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-credits.js');
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        
        // Request immediate sync
        this.requestSync();
        
        console.log('Background sync initialized:', registration);
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    }
  }

  /**
   * Request background sync
   */
  public requestSync(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'REQUEST_CREDITS_SYNC'
      });
    }
  }

  /**
   * Subscribe to balance updates
   */
  public subscribe(callback: (balance: number) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent<BackgroundSyncMessage>): void {
    if (event.data.type === 'CREDITS_UPDATE') {
      // Notify all subscribers
      this.listeners.forEach(callback => callback(event.data.balance));
    }
  }
}

export const backgroundSyncManager = BackgroundSyncManager.getInstance();

/**
 * Hook for using background sync
 */
export const useBackgroundSync = () => {
  const { useState, useEffect } = require('react');
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  useEffect(() => {
    backgroundSyncManager.initialize();

    const unsubscribe = backgroundSyncManager.subscribe((balance) => {
      setLastSyncTime(Date.now());
    });

    return unsubscribe;
  }, []);

  return {
    requestSync: backgroundSyncManager.requestSync,
    lastSyncTime,
  };
};
