import React from 'react';

/**
 * Universal Loader Component
 * Can be used as spinner, skeleton, or full-page loader
 */
const Loader = ({
  type = 'spinner', // 'spinner' | 'skeleton' | 'fullpage' | 'inline'
  size = 'medium', // 'small' | 'medium' | 'large'
  text = '',
  className = '',
  rows = 3,
  cols = 4
}) => {
  const spinnerSizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  // Inline Loader (for buttons, small spaces)
  if (type === 'inline') {
    return (
      <div
        className={`${spinnerSizes[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin ${className}`}
      />
    );
  }

  // Spinner Loader
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div
          className={`${spinnerSizes[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        />
        {text && <p className="text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  // Skeleton Loader (for cards, tables, etc.)
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${80 - (rowIndex * 10)}%` }} />
            <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${60 - (rowIndex * 5)}%` }} />
          </div>
        ))}
      </div>
    );
  }

  // Full Page Loader
  if (type === 'fullpage') {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`${spinnerSizes[size || 'large']} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
          />
          {text && <p className="text-lg font-medium text-gray-700">{text}</p>}
        </div>
      </div>
    );
  }

  // Table Skeleton
  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Stats Grid Skeleton
  if (type === 'stats-grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: rows || 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default Loader;