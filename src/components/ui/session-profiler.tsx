import React from 'react';

// Development-only component to help profile session-related re-renders
const SessionProfiler: React.FC<{ children: React.ReactNode; name: string }> = ({ children, name }) => {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <div data-session-profiler={name}>
      {children}
    </div>
  );
};

export default SessionProfiler;
