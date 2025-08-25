import React from 'react';
import { usePendingCredits, useProjectedBalance } from '@/store/credits.store';

/**
 * Component to show pending credit requests and projected balance
 * Can be used in dashboard or as a header tooltip
 */
export default function CreditsPendingIndicator() {
  const pendingRequests = usePendingCredits();
  const projectedBalance = useProjectedBalance();

  if (pendingRequests.length === 0) return null;

  const totalPendingAmount = pendingRequests.reduce((sum, request) => sum + request.amount, 0);

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Pending Credits
          </span>
        </div>
        <span className="text-sm text-yellow-600 dark:text-yellow-300">
          ${totalPendingAmount}
        </span>
      </div>
      
      <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
        {pendingRequests.length} request{pendingRequests.length > 1 ? 's' : ''} awaiting approval
      </div>
      
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        Projected balance: ${projectedBalance}
      </div>
      
      {/* Individual requests */}
      <div className="mt-2 space-y-1">
        {pendingRequests.slice(0, 3).map((request) => (
          <div key={request.id} className="flex justify-between text-xs text-yellow-600 dark:text-yellow-400">
            <span>Request #{request.id.slice(-6)}</span>
            <span>${request.amount}</span>
          </div>
        ))}
        {pendingRequests.length > 3 && (
          <div className="text-xs text-yellow-500 dark:text-yellow-500">
            +{pendingRequests.length - 3} more...
          </div>
        )}
      </div>
    </div>
  );
}
