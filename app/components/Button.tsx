import { Link } from "@remix-run/react";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

interface ButtonAsButtonProps extends BaseButtonProps, Omit<ComponentProps<"button">, keyof BaseButtonProps | "as"> {
  as?: "button";
  to?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps, Omit<ComponentProps<typeof Link>, keyof BaseButtonProps | "as"> {
  as: "link";
  to: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500",
  outline: "border border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
  ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3",
};

const loadingSpinner = (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const content = (
    <>
      {isLoading && (
        <span className="mr-2" aria-hidden="true">{loadingSpinner}</span>
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="ml-2" aria-hidden="true">{rightIcon}</span>
      )}
    </>
  );

  if ("to" in props) {
    return (
      <Link
        {...(props as ButtonAsLinkProps)}
        className={styles}
        aria-disabled={isDisabled || isLoading}
        tabIndex={isDisabled || isLoading ? -1 : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      {...(props as ButtonAsButtonProps)}
      className={styles}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading}
    >
      {content}
    </button>
  );
}
