'use client';

import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  type?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

export default function Alert({ children, type = 'info', className = '' }: AlertProps) {
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className={`rounded-md border p-4 ${typeClasses[type]} ${className}`}>
      {children}
    </div>
  );
}

