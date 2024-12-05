import type { ReactNode } from "react";

interface FormGroupProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  layout?: "vertical" | "horizontal";
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
}

export default function FormGroup({
  children,
  title,
  description,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  contentClassName = "",
  layout = "vertical",
  required = false,
  error,
  fullWidth = false,
}: FormGroupProps) {
  const containerStyles = `
    ${fullWidth ? "w-full" : ""}
    ${layout === "horizontal" ? "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start" : ""}
    ${className}
  `;

  const labelContainerStyles = `
    ${layout === "horizontal" ? "sm:pt-2" : "mb-4"}
  `;

  const contentContainerStyles = `
    ${layout === "horizontal" ? "sm:col-span-2" : ""}
    ${contentClassName}
  `;

  return (
    <div className={containerStyles}>
      {(title || description) && (
        <div className={labelContainerStyles}>
          {title && (
            <div className={`flex items-center ${titleClassName}`}>
              <label className="block text-sm font-medium text-slate-300">
                {title}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          )}
          {description && (
            <p className={`mt-1 text-sm text-slate-400 ${descriptionClassName}`}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={contentContainerStyles}>
        {children}
        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// Example usage:
// <FormGroup
//   title="Personal Information"
//   description="Please provide your basic information"
//   layout="horizontal"
//   required
// >
//   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//     <Input
//       label="First Name"
//       required
//     />
//     <Input
//       label="Last Name"
//       required
//     />
//   </div>
// </FormGroup>
//
// <FormGroup
//   title="Job Details"
//   description="Enter the details about the position"
//   error="Please fill in all required fields"
// >
//   <div className="space-y-4">
//     <Input
//       label="Company"
//       required
//     />
//     <Input
//       label="Position"
//       required
//     />
//     <Select
//       label="Status"
//       options={statusOptions}
//       required
//     />
//     <Textarea
//       label="Notes"
//       placeholder="Add any additional notes..."
//     />
//   </div>
// </FormGroup>