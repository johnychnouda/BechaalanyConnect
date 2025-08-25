import React from 'react';
import { useNotificationStore } from '@/store/notification.store';
import { usePendingCredits } from '@/store/credits.store';
import Link from 'next/link';

/**
 * Component to show recent credit notifications and pending requests
 * Can be used in the dashboard for quick overview
 */
export default function CreditNotificationSummary() {
    const { notifications } = useNotificationStore();
    const pendingRequests = usePendingCredits();

    // Get recent credit notifications (last 3)
    const recentCreditNotifications = notifications
        .filter(n => n.type === 'credit')
        .slice(0, 3);

    const hasNotifications = recentCreditNotifications.length > 0 || pendingRequests.length > 0;

    if (!hasNotifications) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Credit Updates
                </h3>
                <Link
                    href="/account-dashboard/notifications"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View All
                </Link>
            </div>

            {/* Recent Notifications */}
            {recentCreditNotifications.length > 0 && (
                <div className="space-y-3 mb-4">
                    {recentCreditNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${notification.status === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${notification.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                            }`}></div>
                                        <h4 className={`font-medium text-sm ${notification.status === 'success'
                                                ? 'text-green-800 dark:text-green-200'
                                                : 'text-red-800 dark:text-red-200'
                                            }`}>
                                            {notification.title}
                                        </h4>
                                        {notification.amount && (
                                            <span className={`text-sm font-semibold ${notification.status === 'success'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                ${notification.amount}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs mt-1 ${notification.status === 'success'
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                        }`}>
                                        {notification.description.length > 80
                                            ? `${notification.description.substring(0, 80)}...`
                                            : notification.description
                                        }
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {new Date(notification.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pending Approval ({pendingRequests.length})
                    </h4>
                    {/* <div className="space-y-2">
                        {pendingRequests.slice(0, 2).map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Request #{request.id.toString().slice(-6)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                    ${request.amount}
                                </span>
                            </div>
                        ))}
                        {pendingRequests.length > 2 && (
                            <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                                +{pendingRequests.length - 2} more pending...
                            </div>
                        )}
                    </div> */}
                </div>
            )}

            {/* Action Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Link
                    href="/account-dashboard/add-credits"
                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    Add More Credits
                </Link>
            </div>
        </div>
    );
}
