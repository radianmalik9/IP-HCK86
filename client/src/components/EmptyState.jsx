import React from 'react';

export default function EmptyState({
  icon = '🔍',
  title = 'Nothing here yet',
  message = 'Try changing your search or filters.',
  actions,
  className = '',
}) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="mb-4 text-4xl" aria-hidden>{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {actions && <div className="flex items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}
