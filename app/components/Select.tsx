import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

type SelectVariant = "default" | "filled";
type SelectSize = "sm" | "md" | "lg";
type ValidationState = "valid" | "invalid" | "none";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type BaseSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "className">;

interface SelectProps extends BaseSelectProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  validation?: ValidationState;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  selectClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  errorTextClassName?: string;
}

const variantStyles: Record<SelectVariant, string> = {
  default: "bg-white border border-slate-300 focus:border-blue-500",
  filled: "bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500",
};

const sizeStyles: Record<SelectSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-4 py-3 text-lg",
};

const validationStyles: Record<ValidationState, string> = {
  valid: "border-green-500 focus:border-green-500",
  invalid: "border-red-500 focus:border-red-500",
  none: "",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  errorText,
  variant = "default",
  size = "md",
  fullWidth = false,
  validation = "none",
  options,
  placeholder,
  containerClassName = "",
  selectClassName = "",
  labelClassName = "",
  helperTextClassName = "",
  errorTextClassName = "",
  id,
  disabled,
  required,
  value,
  defaultValue,
  onChange,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = validation === "invalid" || Boolean(errorText);

  const baseSelectStyles = `
    block rounded-md 
    text-slate-900
    appearance-none bg-no-repeat bg-right
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
    pr-10
  `;

  const widthStyles = fullWidth ? "w-full" : "";

  const selectStyles = `
    ${baseSelectStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${validationStyles[validation]}
    ${widthStyles}
    ${selectClassName}
  `;

  const ariaProps = {
    'aria-invalid': hasError,
    'aria-describedby': hasError
      ? `${selectId}-error`
      : helperText
      ? `${selectId}-helper`
      : undefined,
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium text-slate-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          {...ariaProps}
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={selectStyles}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={option.disabled ? "text-slate-400" : ""}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {(helperText || errorText) && (
        <div className="mt-1">
          {helperText && !hasError && (
            <p
              id={`${selectId}-helper`}
              className={`text-sm text-slate-600 ${helperTextClassName}`}
            >
              {helperText}
            </p>
          )}
          {errorText && (
            <p
              id={`${selectId}-error`}
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

Select.displayName = "Select";

export default Select;
