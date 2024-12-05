import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  initialFocus?: boolean;
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  initialFocus = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      if (initialFocus && modalRef.current) {
        modalRef.current.focus();
      }

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose, initialFocus]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fadeIn"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`${sizeStyles[size]} w-full relative bg-slate-800 rounded-lg shadow-xl animate-slideIn`}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700">
            <h2
              id="modal-title"
              className="text-lg font-medium text-white"
            >
              {title}
            </h2>
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-300 transition-colors"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the end of the document body
  return createPortal(
    modalContent,
    document.body
  );
}

// Example usage:
// const [isModalOpen, setIsModalOpen] = useState(false);
//
// <Modal
//   isOpen={isModalOpen}
//   onClose={() => setIsModalOpen(false)}
//   title="Add New Application"
//   footer={
//     <div className="flex justify-end space-x-3">
//       <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
//         Cancel
//       </Button>
//       <Button type="submit" form="applicationForm">
//         Save
//       </Button>
//     </div>
//   }
// >
//   <form id="applicationForm">
//     {/* Form content */}
//   </form>
// </Modal>