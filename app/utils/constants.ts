export const APPLICATION_STATUS = {
  Applied: "Applied",
  Interview: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

export const NOTIFICATION_DURATION = 5000;

export const DATE_FORMAT = "MMM dd, yyyy";

export const ROUTES = {
  HOME: "/",
  APPLICATIONS: "/applications",
} as const;