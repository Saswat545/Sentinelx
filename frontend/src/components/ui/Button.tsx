import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm border border-blue-500/50';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700';
      break;
    case 'outline':
      variantStyles = 'bg-gray-900 text-gray-200 hover:bg-gray-800 border border-gray-800 shadow-xs';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-gray-400 hover:bg-gray-800/60 hover:text-gray-200';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 text-white hover:bg-red-500 border border-red-500/50 shadow-sm';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs gap-1.5';
      break;
    case 'lg':
      sizeStyles = 'px-5 py-2.5 text-sm gap-2';
      break;
    case 'md':
    default:
      sizeStyles = 'px-4 py-2 text-xs font-semibold uppercase tracking-wider md:text-sm md:normal-case md:font-medium gap-2';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
