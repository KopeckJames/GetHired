import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type TextareaVariant = "default" | "filled";
type TextareaSize = "sm" | "md" | "lg";
type ValidationState = "valid" | "invalid" | "none";

type BaseTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "className">;

interface TextareaProps extends BaseTextareaProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: TextareaVariant;
  size?: TextareaSize;
  fullWidth?: boolean;
  validation?: ValidationState;
  containerClassName?: string;
  textareaClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
  autoResize?: boolean;
  maxRows?: number;
}

const variantStyles: Record<TextareaVariant, string> = {
  default: "bg-white border border-slate-300 focus:border-blue-500",
  filled: "bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500",
};

const sizeStyles: Record<TextareaSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-4 py-3 text-lg",
};

const validationStyles: Record<ValidationState, string> = {
  valid: "border-green-500 focus:border-green-500",
  invalid: "border-red-500 focus:border-red-500",
  none: "",
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  errorText,
  variant = "default",
  size = "md",
  fullWidth = false,
  validation = "none",
  containerClassName = "",
  textareaClassName = "",
  labelClassName = "",
  helperTextClassName = "",
  errorTextClassName = "",
  id,
  disabled,
  required,
  autoResize = false,
  maxRows = 10,
  rows = 3,
  onChange,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = validation === "invalid" || Boolean(errorText);

  const baseTextareaStyles = `
    block rounded-md 
    text-slate-900
    placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
    resize-none
  `;

  const widthStyles = fullWidth ? "w-full" : "";

  const textareaStyles = `
    ${baseTextareaStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${validationStyles[validation]}
    ${widthStyles}
    ${textareaClassName}
  `;

  const ariaProps = {
    'aria-invalid': hasError,
    'aria-describedby': hasError
      ? `${textareaId}-error`
      : helperText
      ? `${textareaId}-helper`
      : undefined,
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      const newHeight = Math.min(e.target.scrollHeight, maxRows * 24); // Assuming 24px line height
      e.target.style.height = `${newHeight}px`;
    }
    onChange?.(e);
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`block text-sm font-medium text-slate-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        {...ariaProps}
        ref={ref}
        id={textareaId}
        disabled={disabled}
        required={required}
        rows={rows}
        onChange={handleChange}
        className={textareaStyles}
      />
      {(helperText || errorText) && (
        <div className="mt-1">
          {helperText && !hasError && (
            <p
              id={`${textareaId}-helper`}
              className={`text-sm text-slate-600 ${helperTextClassName}`}
            >
              {helperText}
            </p>
          )}
          {errorText && (
            <p
              id={`${textareaId}-error`}
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

Textarea.displayName = "Textarea";

export default Textarea;
