interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: "pulse" | "wave" | "none";
  repeat?: number;
}

interface SkeletonTextProps extends Omit<SkeletonProps, "variant"> {
  lines?: number;
}

const getWidthStyle = (width: string | number | undefined) => {
  if (typeof width === "number") return `${width}px`;
  return width;
};

const getHeightStyle = (height: string | number | undefined) => {
  if (typeof height === "number") return `${height}px`;
  return height;
};

const animationStyles = {
  pulse: "animate-pulse",
  wave: "animate-shimmer before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-600/10 before:to-transparent",
  none: "",
};

function SingleSkeleton({
  variant = "text",
  width,
  height,
  className = "",
  animation = "pulse",
}: SkeletonProps) {
  const baseStyles = "bg-slate-700/50 relative overflow-hidden";
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const style = {
    width: getWidthStyle(width),
    height: getHeightStyle(height || (variant === "text" ? "1em" : undefined)),
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 1,
  width,
  className = "",
  animation = "pulse",
}: SkeletonTextProps) {
  const widths = Array.isArray(width) ? width : Array(lines).fill(width);

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <SingleSkeleton
          key={index}
          variant="text"
          width={widths[index % widths.length]}
          className={className}
          animation={animation}
        />
      ))}
    </div>
  );
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  animation = "pulse",
  repeat = 1,
}: SkeletonProps) {
  if (repeat > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: repeat }).map((_, index) => (
          <SingleSkeleton
            key={index}
            variant={variant}
            width={width}
            height={height}
            className={className}
            animation={animation}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleSkeleton
      variant={variant}
      width={width}
      height={height}
      className={className}
      animation={animation}
    />
  );
}

// Example usage:
// Basic text skeleton:
// <Skeleton width={200} />
//
// Multiple lines of text with varying widths:
// <SkeletonText
//   lines={3}
//   width={["100%", "80%", "60%"]}
// />
//
// Card skeleton:
// <Card>
//   <div className="space-y-4 p-4">
//     <Skeleton
//       variant="rectangular"
//       width="100%"
//       height={200}
//     />
//     <SkeletonText
//       lines={2}
//       width={["60%", "40%"]}
//     />
//   </div>
// </Card>
//
// Avatar skeleton:
// <Skeleton
//   variant="circular"
//   width={40}
//   height={40}
// />
//
// Table row skeleton:
// <tr>
//   <td><Skeleton width={100} /></td>
//   <td><Skeleton width={150} /></td>
//   <td><Skeleton width={80} /></td>
// </tr>
//
// Loading list:
// <Skeleton
//   variant="rectangular"
//   width="100%"
//   height={60}
//   repeat={5}
//   className="rounded-lg"
// />
//
// Wave animation:
// <Skeleton
//   width={200}
//   animation="wave"
// />