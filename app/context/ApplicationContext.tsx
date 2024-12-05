import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Application, ApplicationStatus } from "~/types";

interface ApplicationState {
  applications: Application[];
  filters: {
    status: ApplicationStatus[];
    search: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sort: {
    field: keyof Application;
    direction: "asc" | "desc";
  };
}

type ApplicationAction =
  | { type: "ADD_APPLICATION"; payload: Application }
  | { type: "UPDATE_APPLICATION"; payload: Application }
  | { type: "DELETE_APPLICATION"; payload: string }
  | { type: "SET_FILTERS"; payload: ApplicationState["filters"] }
  | { type: "SET_SORT"; payload: ApplicationState["sort"] };

const initialState: ApplicationState = {
  applications: [],
  filters: {
    status: [],
    search: "",
  },
  sort: {
    field: "dateApplied",
    direction: "desc",
  },
};

function applicationReducer(
  state: ApplicationState,
  action: ApplicationAction
): ApplicationState {
  switch (action.type) {
    case "ADD_APPLICATION":
      return {
        ...state,
        applications: [...state.applications, action.payload],
      };
    case "UPDATE_APPLICATION":
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id ? action.payload : app
        ),
      };
    case "DELETE_APPLICATION":
      return {
        ...state,
        applications: state.applications.filter((app) => app.id !== action.payload),
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: action.payload,
      };
    case "SET_SORT":
      return {
        ...state,
        sort: action.payload,
      };
    default:
      return state;
  }
}

interface ApplicationContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
  getFilteredAndSortedApplications: () => Application[];
}

const ApplicationContext = createContext<ApplicationContextType | null>(null);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  const getFilteredAndSortedApplications = () => {
    let filtered = state.applications;

    // Apply status filter
    if (state.filters.status.length > 0) {
      filtered = filtered.filter((app) =>
        state.filters.status.includes(app.status)
      );
    }

    // Apply search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(searchLower) ||
          app.position.toLowerCase().includes(searchLower) ||
          app.description?.toLowerCase().includes(searchLower) ||
          app.location?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (state.filters.dateRange) {
      const { start, end } = state.filters.dateRange;
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.dateApplied);
        return (
          appDate >= new Date(start) &&
          appDate <= new Date(end)
        );
      });
    }

    // Apply sorting
    const { field, direction } = state.sort;
    filtered.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle date fields
      if (field === "dateApplied" || field === "createdAt" || field === "updatedAt") {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      return 0;
    });

    return filtered;
  };

  return (
    <ApplicationContext.Provider
      value={{ state, dispatch, getFilteredAndSortedApplications }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error(
      "useApplicationContext must be used within an ApplicationProvider"
    );
  }
  return context;
}