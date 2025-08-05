import React from 'react';

interface DataStaleIndicatorProps {
  timeSinceLastFetch: number | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  staleThreshold?: number; // in milliseconds, default 5 minutes
}

export const DataStaleIndicator: React.FC<DataStaleIndicatorProps> = ({
  timeSinceLastFetch,
  onRefresh,
  isRefreshing,
  staleThreshold = 5 * 60 * 1000, // 5 minutes
}) => {
  if (!timeSinceLastFetch) return null;

  const isStale = timeSinceLastFetch > staleThreshold;
  const minutes = Math.floor(timeSinceLastFetch / (1000 * 60));

  if (!isStale) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm text-yellow-800">
            Data may be outdated (last updated {minutes} minutes ago)
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}; 