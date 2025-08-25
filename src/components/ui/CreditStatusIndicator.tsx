import React from 'react';
import { usePendingCredits, useCreditsBalance } from '@/store/credits.store';

/**
 * Component to show real-time credit status for dashboard
 * Shows pending requests and current balance
 */
export default function CreditStatusIndicator() {
  const pendingRequests = usePendingCredits();
  const currentBalance = useCreditsBalance();

  const totalPendingAmount = pendingRequests.reduce((sum, request) => sum + request.amount, 0);
  const projectedBalance = currentBalance + totalPendingAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Credits Overview
      </h3>
      
      {/* Current Balance */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
        <span className="text-lg font-bold text-green-600 dark:text-green-400">
          ${currentBalance}
        </span>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Pending Approval
            </span>
            <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              ${totalPendingAmount}
            </span>
          </div>

          {/* Projected Balance */}
          <div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Projected Balance
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${projectedBalance}
            </span>
          </div>

          {/* Pending Requests List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pending Requests ({pendingRequests.length})
            </h4>
            {pendingRequests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex justify-between items-center py-2 px-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Request #{request.id.toString().slice(-6)}
                  </span>
                </div>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  ${request.amount}
                </span>
              </div>
            ))}
            {pendingRequests.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                +{pendingRequests.length - 3} more pending...
              </div>
            )}
          </div>
        </>
      )}

      {/* No Pending Requests */}
      {pendingRequests.length === 0 && (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No pending credit requests
          </p>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
