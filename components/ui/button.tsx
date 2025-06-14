import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
