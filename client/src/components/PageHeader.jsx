import React from 'react';

export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <header className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{title}</h1>}
          {subtitle && <p className="mt-1 text-secondary-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
