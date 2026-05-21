'use client';

import { ReactNode } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-900',
    error: 'text-red-900',
    info: 'text-blue-900',
  }[type];

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg border ${bgColor} ${textColor} shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full ${iconColor}`} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
