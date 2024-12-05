import type { ComponentProps, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "bordered";

type BaseProps = Omit<ComponentProps<"div">, "className" | "title">;

interface CardProps extends BaseProps {
  variant?: CardVariant;
  className?: string;
  cardTitle?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  isInteractive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white",
  elevated: "bg-white shadow-lg hover:shadow-xl transition-shadow",
  bordered: "bg-white border border-slate-200",
};

export default function Card({
  variant = "default",
  className = "",
  cardTitle,
  description,
  footer,
  isInteractive = false,
  isSelected = false,
  onClick,
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-lg overflow-hidden";
  const interactiveStyles = isInteractive
    ? "cursor-pointer hover:bg-slate-50 transition-colors"
    : "";
  const selectedStyles = isSelected
    ? "ring-2 ring-blue-500 ring-offset-2"
    : "";
  const styles = `${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${selectedStyles} ${className}`;

  const content = (
    <>
      {(cardTitle || description) && (
        <div className="p-6">
          {cardTitle && (
            <h3 className="text-lg font-medium text-slate-900">
              {cardTitle}
            </h3>
          )}
          {description && (
            <div className="mt-2 text-sm text-slate-600">
              {description}
            </div>
          )}
        </div>
      )}
      {children && (
        <div className={`${cardTitle || description ? "" : "p-6"}`}>
          {children}
        </div>
      )}
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          {footer}
        </div>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={styles}
        aria-pressed={isSelected}
        {...props}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={styles} {...props}>
      {content}
    </div>
  );
}
