import type { ComponentProps } from "react";

type BadgeVariant = "info" | "success" | "warning" | "error" | "default";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends Omit<ComponentProps<"span">, "className"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  withDot?: boolean;
  isAnimated?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  default: "bg-slate-100 text-slate-700",
};

const dotStyles: Record<BadgeVariant, string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  default: "bg-slate-500",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export default function Badge({
  variant = "default",
  size = "md",
  className = "",
  withDot = false,
  isAnimated = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-colors duration-200";
  const animationStyles = isAnimated ? "animate-pulse" : "";
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${animationStyles} ${className}`;

  return (
    <span className={styles} {...props}>
      {withDot && (
        <span
          className={`${dotSizeStyles[size]} rounded-full ${dotStyles[variant]} mr-1.5 transition-colors duration-200`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Example usage:
// <Badge variant="success" withDot>Active</Badge>
// <Badge variant="warning" size="lg">Pending</Badge>
// <Badge variant="error" isAnimated>Urgent</Badge>

// Application status badges:
// <Badge variant="info">Applied</Badge>
// <Badge variant="warning">Interview</Badge>
// <Badge variant="success">Offer</Badge>
// <Badge variant="error">Rejected</Badge>

// Custom application status mapping:
export const applicationStatusStyles: Record<string, BadgeVariant> = {
  Applied: "info",
  Interview: "warning",
  Offer: "success",
  Rejected: "error",
};

// Helper function to get the appropriate badge variant for an application status
export function getStatusBadgeVariant(status: string): BadgeVariant {
  return applicationStatusStyles[status] || "default";
}

// Example usage with application status:
// <Badge variant={getStatusBadgeVariant(application.status)}>
//   {application.status}
// </Badge>
