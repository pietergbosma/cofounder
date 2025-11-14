import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  const hoverStyles = hoverable ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer' : '';
  
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
