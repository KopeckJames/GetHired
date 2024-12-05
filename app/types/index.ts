// Application Status Types
export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

// Application Types
export interface Application {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  location?: string;
  salary?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  description?: string;
  notes?: string;
  url?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  nextSteps?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface ApplicationFormData {
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  location?: string;
  salary?: string;
  jobType?: string;
  description?: string;
  notes?: string;
  url?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  nextSteps?: string;
  interviewDate?: string;
}

// Filter Types
export interface ApplicationFilters {
  status?: ApplicationStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  jobType?: string[];
  search?: string;
}

// Sort Types
export type SortField = 'company' | 'position' | 'status' | 'dateApplied' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// Statistics Types
export interface ApplicationStatistics {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byJobType: Record<string, number>;
  averageResponseTime?: number;
  successRate?: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Component Prop Types
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: string | number;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
  group?: string;
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  createdAt: string;
}

// Analytics Types
export interface ApplicationMetrics {
  applicationsPerDay: {
    date: string;
    count: number;
  }[];
  responseRates: {
    status: ApplicationStatus;
    percentage: number;
  }[];
  popularCompanies: {
    company: string;
    count: number;
  }[];
  averageTimeToResponse: number;
}

// Settings Types
export interface UserPreferences {
  theme: ThemeMode;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  defaultFilters: ApplicationFilters;
  defaultSort: SortOption;
  displayColumns: string[];
}

// Export constants
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
];

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Remote',
] as const;

export const SORT_FIELDS: SortField[] = [
  'company',
  'position',
  'status',
  'dateApplied',
  'updatedAt',
];

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT: SortOption = {
  field: 'dateApplied',
  direction: 'desc',
};