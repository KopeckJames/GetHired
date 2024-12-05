import { useState, useEffect, useCallback, useRef } from 'react';
import { getLocalStorage, setLocalStorage } from '~/utils/helpers';
import type { ApplicationFormData } from '~/types';

// Form hook for managing form state and validation
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    name: keyof T,
    value: T[keyof T]
  ) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (validate) {
      const validationErrors = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
    }
  }, [values, validate]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
    }
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setErrors,
    setTouched,
    setIsSubmitting,
    handleChange,
    handleBlur,
    resetForm,
  };
}

// Modal hook for managing modal state
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const modalRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, close]);

  return { isOpen, open, close, toggle, modalRef };
}

// Local storage hook with type safety
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getLocalStorage(key, initialValue);
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    setLocalStorage(key, valueToStore);
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Draft application hook for auto-saving form data
export function useDraftApplication() {
  const [draft, setDraft] = useLocalStorage<Partial<ApplicationFormData> | null>(
    'application-draft',
    null
  );

  const saveDraft = useCallback((data: Partial<ApplicationFormData>) => {
    setDraft(data);
  }, [setDraft]);

  const clearDraft = useCallback(() => {
    setDraft(null);
  }, [setDraft]);

  return { draft, saveDraft, clearDraft };
}

// Intersection observer hook for infinite scrolling
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver>();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observerRef.current = observer;

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return elementRef;
}

// Media query hook for responsive design
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Previous value hook for comparing changes
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}