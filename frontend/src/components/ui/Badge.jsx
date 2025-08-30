import React from 'react';

const Badge = ({ children, variant = 'primary', size = 'medium' }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    secondary: 'bg-gray-100 text-gray-800'
  };

  const sizes = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-2.5 py-0.5',
    large: 'text-sm px-3 py-1'
  };

  return (
    <span className={`badge ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Badge;