'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      {children}
    </div>
  );
}

