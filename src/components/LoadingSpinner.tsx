
import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Processing...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
