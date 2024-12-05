import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputVariant = "default" | "filled";
type InputSize = "sm" | "md" | "lg";
type ValidationState = "valid" | "invalid" | "none";

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "className">;

interface InputProps extends BaseInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  validation?: ValidationState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
}

const variantStyles: Record<InputVariant, string> = {
  default: "bg-white border border-slate-300 focus:border-blue-500",
  filled: "bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500",
};

const sizeStyles: Record<InputSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-4 py-3 text-lg",
};

const validationStyles: Record<ValidationState, string> = {
  valid: "border-green-500 focus:border-green-500",
  invalid: "border-red-500 focus:border-red-500",
  none: "",
};

const iconSizeStyles: Record<InputSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  errorText,
  variant = "default",
  size = "md",
  fullWidth = false,
  validation = "none",
  leftIcon,
  rightIcon,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  helperTextClassName = "",
  errorTextClassName = "",
  id,
  disabled,
  required,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = validation === "invalid" || Boolean(errorText);

  const baseInputStyles = `
    block rounded-md 
    text-slate-900
    placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const widthStyles = fullWidth ? "w-full" : "";
  const iconPaddingLeft = leftIcon ? "pl-10" : "";
  const iconPaddingRight = rightIcon ? "pr-10" : "";

  const inputStyles = `
    ${baseInputStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${validationStyles[validation]}
    ${widthStyles}
    ${iconPaddingLeft}
    ${iconPaddingRight}
    ${inputClassName}
  `;

  const ariaProps = {
    'aria-invalid': hasError,
    'aria-describedby': hasError
      ? `${inputId}-error`
      : helperText
      ? `${inputId}-helper`
      : undefined,
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-slate-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <span className={iconSizeStyles[size]}>{leftIcon}</span>
          </div>
        )}
        <input
          {...props}
          {...ariaProps}
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={inputStyles}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <span className={iconSizeStyles[size]}>{rightIcon}</span>
          </div>
        )}
      </div>
      {(helperText || errorText) && (
        <div className="mt-1">
          {helperText && !hasError && (
            <p
              id={`${inputId}-helper`}
              className={`text-sm text-slate-600 ${helperTextClassName}`}
            >
              {helperText}
            </p>
          )}
          {errorText && (
            <p
              id={`${inputId}-error`}
              className={`text-sm text-red-500 ${errorTextClassName}`}
              role="alert"
            >
              {errorText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
