import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-bold rounded-full transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-yellow-500 hover:bg-yellow-400 text-gray-900",
    secondary: "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/40",
    danger: "bg-red-500 hover:bg-red-400 text-white"
  };

  const sizes = {
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-xl",
    xl: "px-12 py-6 text-2xl tracking-wide"
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};