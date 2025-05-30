
import React from 'react';
import LoadingIcon from './LoadingIcon';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  isLoading = false,
  icon,
  variant = 'primary',
  className,
  ...props
}) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150";
  
  let variantStyle = "";
  switch(variant) {
    case 'primary':
      variantStyle = "text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500";
      break;
    case 'secondary':
      variantStyle = "text-sky-300 bg-slate-700 hover:bg-slate-600 focus:ring-sky-400";
      break;
    case 'danger':
      variantStyle = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
      break;
  }

  return (
    <button
      type="button"
      className={`${baseStyle} ${variantStyle} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <LoadingIcon className="w-5 h-5 mr-2" />
      ) : (
        icon && <span className="mr-2 h-5 w-5">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default ActionButton;
    