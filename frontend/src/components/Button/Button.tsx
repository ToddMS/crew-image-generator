import React, { forwardRef } from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      children,
      leftIcon,
      rightIcon,
      className = '',
      ...props
    },
    ref,
  ) => {
    const buttonClasses = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      loading && 'btn-loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || loading} {...props}>
        {leftIcon && !loading && <span className="btn-icon btn-icon-left">{leftIcon}</span>}

        {loading && (
          <span className="btn-icon btn-icon-left">
            <div className="btn-spinner" />
          </span>
        )}

        <span className="btn-content">{children}</span>

        {rightIcon && !loading && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
