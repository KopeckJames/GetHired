interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "blue" | "slate";
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const colorStyles = {
  white: "text-white",
  blue: "text-blue-500",
  slate: "text-slate-400",
};

export default function LoadingSpinner({
  size = "md",
  color = "white",
  className = "",
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <svg
        className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
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
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Example usage:
// <LoadingSpinner /> // Default medium white spinner
// <LoadingSpinner size="lg" color="blue" /> // Large blue spinner
// <LoadingSpinner size="sm" color="slate" label="Saving..." /> // Small slate spinner with custom label
//
// With button:
// <Button disabled={isLoading}>
//   {isLoading ? (
//     <>
//       <LoadingSpinner size="sm" />
//       Loading...
//     </>
//   ) : (
//     'Submit'
//   )}
// </Button>
//
// Centered in container:
// <div className="flex items-center justify-center h-64">
//   <LoadingSpinner size="lg" />
// </div>
//
// With text:
// <div className="flex items-center gap-2">
//   <LoadingSpinner size="sm" />
//   <span>Loading data...</span>
// </div>
//
// Full page loading:
// <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center">
//   <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
//     <LoadingSpinner size="lg" />
//   </div>
// </div>