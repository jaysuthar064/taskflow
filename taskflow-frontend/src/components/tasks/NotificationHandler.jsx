import React, { useEffect, useRef, useState } from 'react';
import { BellRing, X } from "lucide-react";

const STORAGE_KEY = "taskflow-reminder-notifications";

const NotificationHandler = ({ tasks }) => {
    const scheduledNotifications = useRef(new Set());
    const scheduledTimeouts = useRef(new Map());
    const [activeAlerts, setActiveAlerts] = useState([]);

    useEffect(() => {
        try {
            const storedNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            scheduledNotifications.current = new Set(storedNotifications);
        } catch (error) {
            scheduledNotifications.current = new Set();
        }
    }, []);

    const persistNotifications = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(Array.from(scheduledNotifications.current))
        );
    };

    const clearScheduledTimeouts = () => {
        scheduledTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
        scheduledTimeouts.current = new Map();
    };

    const notifyTask = (task, notificationKey, mode = "due") => {
        if (scheduledNotifications.current.has(notificationKey)) {
            return;
        }

        scheduledNotifications.current.add(notificationKey);
        persistNotifications();
        setActiveAlerts((prevAlerts) => {
            if (prevAlerts.some((alert) => alert.id === notificationKey)) {
                return prevAlerts;
            }

            return [
                {
                    id: notificationKey,
                    title: task.title,
                    description:
                        mode === "overdue"
                            ? task.description || "Reminder time already passed."
                            : task.description || "Your reminder time is now.",
                    mode
                },
                ...prevAlerts
            ];
        });

        if (Notification.permission !== "granted") {
            return;
        }

        const titlePrefix = mode === "overdue" ? "TaskFlow Alert" : "TaskFlow Reminder";
        const body =
            mode === "overdue"
                ? task.description || "This reminder time has already passed."
                : task.description || "Your task reminder is due now.";

        new Notification(`${titlePrefix}: ${task.title}`, {
            body,
            icon: "https://cdn-icons-png.flaticon.com/512/1043/1043586.png",
            requireInteraction: mode !== "overdue"
        });
    };

    useEffect(() => {
        // Request permission silently if possible, but we'll use a button in Dashboard for the gesture
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!("Notification" in window)) {
            console.error("This browser does not support desktop notification");
            return;
        }

        clearScheduledTimeouts();

        const checkReminders = () => {
            const now = new Date().getTime();
            
            tasks.forEach((task) => {
                if (task.reminder && !task.completed) {
                    const reminderTime = new Date(task.reminder).getTime();
                    const notificationKey = `${task._id}-${reminderTime}`;
                    const diff = reminderTime - now;

                    if (Number.isNaN(reminderTime)) {
                        return;
                    }

                    if (reminderTime <= now) {
                        notifyTask(task, notificationKey, "overdue");
                        return;
                    }

                    if (scheduledTimeouts.current.has(notificationKey)) {
                        return;
                    }

                    const timeoutId = setTimeout(() => {
                        scheduledTimeouts.current.delete(notificationKey);
                        notifyTask(task, notificationKey, "due");
                    }, diff);
                    scheduledTimeouts.current.set(notificationKey, timeoutId);
                }
            });
        };

        const interval = setInterval(checkReminders, 30000);
        checkReminders();

        return () => {
            clearInterval(interval);
            clearScheduledTimeouts();
        };
    }, [tasks]);

    return (
        <div className="fixed bottom-4 right-4 z-[120] w-[calc(100vw-2rem)] max-w-sm space-y-3 pointer-events-none">
            {activeAlerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`pointer-events-auto rounded-2xl border shadow-xl p-4 backdrop-blur-sm ${
                        alert.mode === "overdue"
                            ? "bg-red-50/95 border-red-200"
                            : "bg-white/95 border-primary-200"
                    }`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <BellRing
                                    size={16}
                                    className={alert.mode === "overdue" ? "text-red-500" : "text-primary-600"}
                                />
                                <p className="text-sm font-semibold text-surface-900 break-words">
                                    {alert.title}
                                </p>
                            </div>
                            <p className="text-xs text-surface-600 mt-2 break-words">
                                {alert.description}
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                setActiveAlerts((prevAlerts) =>
                                    prevAlerts.filter((item) => item.id !== alert.id)
                                )
                            }
                            className="p-1 rounded-full text-surface-400 hover:text-surface-700 hover:bg-white/70 transition-colors"
                            title="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationHandler;
