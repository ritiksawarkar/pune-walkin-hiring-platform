import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { adminService } from "../../../services/adminService";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getNotifications(0, 50);
      const list = data?.content || (Array.isArray(data) ? data : []);
      setNotifications(list);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await adminService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true, isRead: true } : item))
      );
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read && !item.isRead).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">Unread notifications</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{unreadCount}</p>
      </div>

      <Card title="Notification Center" subtitle="Live alerts, application submissions, and registration updates from MySQL" padding="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
            <p>Loading notifications from database...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600 bg-rose-50 rounded-b-2xl">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No notifications in your inbox.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const isUnread = !notification.read && !notification.isRead;
              return (
                <div key={notification.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                      {isUnread && <Badge variant="warning" size="sm">New</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{notification.message || notification.detail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString("en-IN") : "Recent"}
                    </span>
                    {!isUnread && <Badge variant="success" size="sm">Read</Badge>}
                    {isUnread && (
                      <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
