import React from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Filter,
  CheckCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface Notification {
  id: number;
  title: string;
  description: string;
  type: "urgent" | "warning" | "info" | "success";
  time: string;
  isRead: boolean;
  category: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Urgent Maintenance",
    description:
      "Generator A-12 requires immediate oil change and filter replacement based on running hours.",
    type: "urgent",
    time: "2m ago",
    isRead: false,
    category: "Maintenance",
  },
  {
    id: 2,
    title: "AMC Expiring Soon",
    description:
      "The Dell Support contract (AMC-2024-05) expires in 14 days. Please review renewal terms.",
    type: "warning",
    time: "1h ago",
    isRead: false,
    category: "Contract",
  },
  {
    id: 3,
    title: "Asset Audited Successfully",
    description:
      "Workstation 405 was successfully verified by the floor manager during the weekly scan.",
    type: "success",
    time: "3h ago",
    isRead: true,
    category: "Audit",
  },
  {
    id: 4,
    title: "New Asset Shared",
    description:
      "The HR department shared 10 new Laptops with your department. Please accept and tag them.",
    type: "info",
    time: "5h ago",
    isRead: true,
    category: "Asset",
  },
  {
    id: 5,
    title: "Warranty Claim Approved",
    description:
      "The claim for MacBook Air (M1-129) has been approved. Replacement parts are on the way.",
    type: "success",
    time: "1d ago",
    isRead: true,
    category: "Warranty",
  },
  {
    id: 6,
    title: "System Security Alert",
    description:
      "A new login was detected for your account from a new IP: 192.168.1.45.",
    type: "warning",
    time: "2d ago",
    isRead: true,
    category: "Security",
  },
  {
    id: 7,
    title: "GPS Tracker Offline",
    description:
      "Vehicle DL-36-CA-1002 has lost signal for over 4 hours. Last known location: Sector 5 Industrial Area.",
    type: "urgent",
    time: "2d ago",
    isRead: true,
    category: "GPS",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    React.useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = React.useState<string>("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div
      className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500 p-2 sm:p-0"
      id="notifications_page"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-brand" /> Notifications
            Center
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest mt-1">
            Manage your alerts and system updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="w-full md:w-auto px-6 py-3 bg-slate-50 dark:bg-white/5 border border-border-dim rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all shadow-sm flex items-center justify-center"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar - Horizontal on mobile */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl overflow-x-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 whitespace-nowrap">
              <Filter className="w-3 h-3" /> Filter Notifications
            </h3>
            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
              {[
                { id: "all", label: "All Alerts", icon: Bell },
                { id: "unread", label: "Unread", icon: CheckCircle },
                { id: "urgent", label: "Urgent", icon: AlertTriangle },
                { id: "warning", label: "Warning", icon: AlertTriangle },
                { id: "success", label: "Success", icon: CheckCircle2 },
                { id: "info", label: "General", icon: Info },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex-1 lg:w-full flex items-center justify-between gap-3 p-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    filter === f.id
                      ? "bg-brand text-white shadow-lg shadow-brand/20"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5",
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <f.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {f.label}
                  </div>
                  {f.id !== "unread" && (
                    <span className="text-[9px] sm:text-[10px] opacity-60 ml-2">
                      {
                        notifications.filter((n) =>
                          f.id === "all" ? true : n.type === f.id,
                        ).length
                      }
                    </span>
                  )}
                  {f.id === "unread" && (
                    <span className="bg-rose-500 text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ml-2">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2rem] p-10 sm:p-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-400">
                No Notifications Found
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xs">
                There are no alerts matching your current filter criteria.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "group bg-card-bg border border-border-dim rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all hover:border-brand/40",
                  !notif.isRead && "border-l-4 border-l-brand",
                )}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div
                    className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border-4 border-app-bg shadow-xl shrink-0",
                      notif.type === "urgent"
                        ? "bg-rose-500 text-white"
                        : notif.type === "warning"
                          ? "bg-amber-500 text-white"
                          : notif.type === "success"
                            ? "bg-emerald-500 text-white"
                            : "bg-brand text-white",
                    )}
                  >
                    {notif.type === "urgent" ? (
                      <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8" />
                    ) : notif.type === "warning" ? (
                      <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8" />
                    ) : notif.type === "success" ? (
                      <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8" />
                    ) : (
                      <Info className="w-6 sm:w-8 h-6 sm:h-8" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-3">
                        <h3
                          className={cn(
                            "text-base sm:text-lg font-black tracking-tight leading-tight",
                            !notif.isRead
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500",
                          )}
                        >
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-brand rounded-full animate-pulse flex-shrink-0"></span>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {notif.time}
                        </span>
                        <div className="relative group/menu">
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-32 bg-app-bg border border-border-dim rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="w-full flex items-center gap-2 p-3 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                      {notif.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <span className="px-2 sm:px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest border border-border-dim/50">
                        #{notif.category}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id ? { ...n, isRead: true } : n,
                              ),
                            )
                          }
                          className="text-[9px] font-black text-brand uppercase tracking-widest hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
