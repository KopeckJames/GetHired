import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import Alert from "~/components/Alert";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string) => {
      const id = crypto.randomUUID();
      const notification: Notification = {
        id,
        type,
        title,
        message,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto remove notification after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      {/* Notification container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            variant={notification.type}
            title={notification.title}
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}