import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  className?: string;
  contentClassName?: string;
  maxWidth?: number;
  disabled?: boolean;
  showArrow?: boolean;
}

const placementStyles: Record<TooltipPlacement, { tooltip: string; arrow: string }> = {
  top: {
    tooltip: "-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+8px)]",
    arrow: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-slate-700 border-l-transparent border-r-transparent border-b-transparent",
  },
  bottom: {
    tooltip: "-translate-x-1/2 translate-y-full left-1/2 top-[calc(100%+8px)]",
    arrow: "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-slate-700 border-l-transparent border-r-transparent border-t-transparent",
  },
  left: {
    tooltip: "-translate-x-full -translate-y-1/2 top-1/2 right-[calc(100%+8px)]",
    arrow: "right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-slate-700 border-t-transparent border-b-transparent border-r-transparent",
  },
  right: {
    tooltip: "translate-x-full -translate-y-1/2 top-1/2 left-[calc(100%+8px)]",
    arrow: "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-slate-700 border-t-transparent border-b-transparent border-l-transparent",
  },
};

export default function Tooltip({
  content,
  children,
  placement = "top",
  delay = 200,
  className = "",
  contentClassName = "",
  maxWidth = 200,
  disabled = false,
  showArrow = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        setIsVisible(true);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  const styles = placementStyles[placement];

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 px-2 py-1
            bg-slate-700 text-white text-sm
            rounded shadow-lg
            pointer-events-none
            whitespace-normal
            ${styles.tooltip}
            ${contentClassName}
          `}
          style={{ maxWidth }}
        >
          {content}
          {showArrow && (
            <div
              className={`
                absolute w-0 h-0
                border-solid border-4
                ${styles.arrow}
              `}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Example usage:
// <Tooltip content="Delete this application">
//   <button>
//     <TrashIcon className="h-5 w-5" />
//   </button>
// </Tooltip>
//
// <Tooltip
//   content={
//     <div className="space-y-1">
//       <p className="font-medium">Application Status</p>
//       <p>Track the progress of your job application</p>
//     </div>
//   }
//   placement="right"
//   maxWidth={300}
// >
//   <InfoIcon className="h-5 w-5 text-slate-400" />
// </Tooltip>
//
// <Tooltip
//   content="This field is required"
//   placement="bottom"
//   delay={0}
//   className="inline-flex"
// >
//   <span className="text-red-500">*</span>
// </Tooltip>
//
// <Tooltip
//   content="Feature coming soon!"
//   disabled={isFeatureEnabled}
// >
//   <button disabled={!isFeatureEnabled}>
//     New Feature
//   </button>
// </Tooltip>