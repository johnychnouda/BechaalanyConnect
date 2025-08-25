import { useCreditsStore } from '@/store/credits.store';
import { useNotificationStore } from '@/store/notification.store';
import { toast } from 'react-toastify';

export class CreditsService {
  private static instance: CreditsService;
  
  public static getInstance(): CreditsService {
    if (!CreditsService.instance) {
      CreditsService.instance = new CreditsService();
    }
    return CreditsService.instance;
  }

  /**
   * Add a pending credit request that will be reflected in the UI
   */
  public addPendingRequest(requestId: string, amount: number): void {
    const { addPendingRequest } = useCreditsStore.getState();
    const { addNotification } = useNotificationStore.getState();
    
    addPendingRequest({ id: requestId, amount });
    
    // Add notification instead of toast
    addNotification({
      status: 'success',
      title: 'Credit Request Submitted',
      description: `Your credit request of $${amount} has been submitted and is pending approval. Balance will update automatically once approved.`,
      date: new Date().toISOString(),
      readStatus: 'unread',
      type: 'credit',
      amount: amount,
      request_id: requestId,
    });
    
    // Optional: Keep toast for immediate feedback (can be removed if you prefer notifications only)
    // toast.info(`Credit request of $${amount} submitted successfully!`);
  }

  /**
   * Mark a credit request as approved and update balance
   */
  public approveCreditRequest(requestId: string, amount?: number): void {
    try {
      if (!requestId || typeof requestId !== 'string') {
        console.error('Invalid request ID for credit approval:', requestId);
        return;
      }

      const { approvePendingRequest, updateBalance } = useCreditsStore.getState();
      const { addNotification } = useNotificationStore.getState();
      
      const credits = useCreditsStore.getState();
      const pendingRequest = credits.pendingRequests.find(r => r.id === requestId);
      
      // Use the amount from the notification if provided, otherwise use pending request amount
      const creditAmount = amount || pendingRequest?.amount || 0;
      
      if (creditAmount <= 0) {
        console.error('Invalid credit amount for approval:', creditAmount);
        return;
      }
      
      // If we have a pending request, use the store method to move it to balance
      if (pendingRequest) {
        approvePendingRequest(requestId);
      } else {
        // If no pending request found (maybe from external approval), directly add to balance
        updateBalance(creditAmount);
      }
      
      // Add approval notification
      addNotification({
        status: 'success',
        title: 'Credit Request Approved',
        description: `Great news! Your credit request has been approved and $${creditAmount} has been added to your balance.`,
        date: new Date().toISOString(),
        readStatus: 'unread',
        type: 'credit',
        amount: creditAmount,
        request_id: requestId,
      });
      
      console.log(`✅ Credit approved: $${creditAmount} added to balance for request ${requestId}`);
    } catch (error) {
      console.error('Error approving credit request:', error, { requestId, amount });
    }
  }

  /**
   * Mark a credit request as rejected
   */
  public rejectCreditRequest(requestId: string): void {
    const { rejectPendingRequest } = useCreditsStore.getState();
    const { addNotification } = useNotificationStore.getState();
    
    const credits = useCreditsStore.getState();
    const pendingRequest = credits.pendingRequests.find(r => r.id === requestId);
    
    rejectPendingRequest(requestId);
    
    // Add rejection notification
    addNotification({
      status: 'rejected',
      title: 'Credit Request Rejected',
      description: `We're sorry, but your credit request for $${pendingRequest?.amount || 0} has been rejected. Please check your payment details or contact support for assistance.`,
      date: new Date().toISOString(),
      readStatus: 'unread',
      type: 'credit',
      amount: pendingRequest?.amount || 0,
      request_id: requestId,
    });
    
    // Optional: Keep toast for immediate feedback (can be removed if you prefer notifications only)
    // toast.error('Credit request was rejected. Please contact support if you have questions.');
  }

  /**
   * Update balance directly (for manual corrections or external updates)
   */
  public updateBalance(newBalance: number): void {
    const { setBalance } = useCreditsStore.getState();
    setBalance(newBalance);
  }

  /**
   * Refresh balance from user session data
   */
  public syncBalanceFromSession(sessionBalance: number): void {
    const { setBalance } = useCreditsStore.getState();
    setBalance(sessionBalance);
  }

  /**
   * Add to existing balance (for immediate credits)
   */
  public addToBalance(amount: number): void {
    const { updateBalance } = useCreditsStore.getState();
    const { addNotification } = useNotificationStore.getState();
    
    updateBalance(amount);
    
    // Add credit addition notification
    addNotification({
      status: 'success',
      title: 'Credits Added',
      description: `$${amount} has been successfully added to your balance!`,
      date: new Date().toISOString(),
      readStatus: 'unread',
      type: 'credit',
      amount: amount,
    });
    
    // Optional: Keep toast for immediate feedback (can be removed if you prefer notifications only)
    // toast.success(`$${amount} has been added to your balance!`);
  }

  /**
   * Deduct from balance (for purchases)
   */
  public deductFromBalance(amount: number, description?: string): void {
    const { updateBalance } = useCreditsStore.getState();
    const { addNotification } = useNotificationStore.getState();
    
    updateBalance(-amount);
    
    // Add purchase notification
    addNotification({
      status: 'success',
      title: 'Purchase Completed',
      description: description || `$${amount} has been deducted from your balance for your purchase.`,
      date: new Date().toISOString(),
      readStatus: 'unread',
      type: 'credit',
      amount: -amount, // Negative amount to indicate deduction
    });
  }

  /**
   * Check if user has sufficient balance for a purchase
   */
  public hasSufficientBalance(requiredAmount: number): boolean {
    const { balance } = useCreditsStore.getState();
    return balance >= requiredAmount;
  }

  /**
   * Get current balance including pending amounts
   */
  public getProjectedBalance(): number {
    const { getProjectedBalance } = useCreditsStore.getState();
    return getProjectedBalance();
  }
}

// Export singleton instance
export const creditsService = CreditsService.getInstance();

// Export convenient hooks for components
export const useCreditOperations = () => {
  return {
    addPendingRequest: creditsService.addPendingRequest.bind(creditsService),
    approveCreditRequest: creditsService.approveCreditRequest.bind(creditsService),
    rejectCreditRequest: creditsService.rejectCreditRequest.bind(creditsService),
    updateBalance: creditsService.updateBalance.bind(creditsService),
    syncBalanceFromSession: creditsService.syncBalanceFromSession.bind(creditsService),
    addToBalance: creditsService.addToBalance.bind(creditsService),
    deductFromBalance: creditsService.deductFromBalance.bind(creditsService),
    hasSufficientBalance: creditsService.hasSufficientBalance.bind(creditsService),
    getProjectedBalance: creditsService.getProjectedBalance.bind(creditsService),
  };
};
