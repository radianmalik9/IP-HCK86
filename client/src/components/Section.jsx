import React from 'react';

export function Section({ title, right, children, className = '' }) {
  return (
    <section className={`mt-8 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {right && <div className="text-sm text-secondary-600">{right}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-secondary-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-b border-secondary-200 ${className}`}>{children}</div>
  );
}
