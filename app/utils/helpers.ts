import type { Application, ApplicationStatus } from '~/types';

// Date formatting utilities
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const dateObj = new Date(date);
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(date, 'short');
}

// Status utilities
export function getStatusColor(status: ApplicationStatus): {
  background: string;
  text: string;
} {
  const colors = {
    Applied: {
      background: 'bg-status-applied-bg',
      text: 'text-status-applied-text',
    },
    Interview: {
      background: 'bg-status-interview-bg',
      text: 'text-status-interview-text',
    },
    Offer: {
      background: 'bg-status-offer-bg',
      text: 'text-status-offer-text',
    },
    Rejected: {
      background: 'bg-status-rejected-bg',
      text: 'text-status-rejected-text',
    },
  };

  return colors[status];
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Data manipulation utilities
export function sortApplications(
  applications: Application[],
  field: keyof Application,
  direction: 'asc' | 'desc'
): Application[] {
  return [...applications].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue === bValue) return 0;
    if (aValue === undefined) return direction === 'asc' ? -1 : 1;
    if (bValue === undefined) return direction === 'asc' ? 1 : -1;

    if (direction === 'asc') {
      return aValue < bValue ? -1 : 1;
    }
    return aValue > bValue ? -1 : 1;
  });
}

export function filterApplications(
  applications: Application[],
  filters: {
    status?: ApplicationStatus[];
    search?: string;
    dateRange?: { start: string; end: string };
  }
): Application[] {
  return applications.filter((app) => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(app.status)) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        app.company,
        app.position,
        app.location,
        app.description,
        app.notes,
        app.contactName,
      ].filter(Boolean);

      if (!searchableFields.some((field) => field?.toLowerCase().includes(searchTerm))) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const appDate = new Date(app.dateApplied);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);

      if (appDate < startDate || appDate > endDate) {
        return false;
      }
    }

    return true;
  });
}

// Statistics utilities
export function calculateStatistics(applications: Application[]) {
  const total = applications.length;
  const byStatus = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );

  const responseRate =
    total > 0
      ? ((byStatus.Interview || 0) + (byStatus.Offer || 0)) / total
      : 0;

  return {
    total,
    byStatus,
    responseRate: Math.round(responseRate * 100),
  };
}

// Local storage utilities
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Error handling utilities
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Debounce utility with proper typing
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}