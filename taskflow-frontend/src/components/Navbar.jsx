import React, { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import {
  Bell,
  Clock,
  Loader2,
  LogOut,
  Mail,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck
} from "lucide-react";
import API from "../api/axios";

const formatJoinedDate = (value) => {
  if (!value) {
    return "Recently";
  }

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "Recently";
  }
};

const Navbar = ({ onToggleSidebar, searchQuery, setSearchQuery, setActiveView }) => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfilePanel, setShowProfilePanel] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(false);
  const notificationsRef = React.useRef(null);
  const profileRef = React.useRef(null);

  const initials = user?.name
    ? user.name.split(" ").map((namePart) => namePart[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const loginMethodsLabel = [
    user?.loginMethods?.password ? "Password" : null,
    user?.loginMethods?.google ? "Google" : null
  ]
    .filter(Boolean)
    .join(" + ") || "Password";

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await API.get("/notifications");
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleClearNotifications = async () => {
    try {
      setLoadingNotifications(true);
      await API.delete("/notifications");
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const openProfileSettings = () => {
    setActiveView("settings");
    setShowProfilePanel(false);
    setShowNotifications(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  React.useEffect(() => {
    const handlePointerDown = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfilePanel(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-surface-200 px-2.5 sm:px-4 lg:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all lg:hidden shrink-0"
            title="Menu"
          >
            <PanelLeftOpen size={18} />
          </button>

          <div className="flex items-center space-x-2 lg:hidden hidden min-[400px]:flex shrink-0">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-black text-lg tracking-tighter">T</span>
            </div>
            <span className="font-bold text-sm text-surface-900 tracking-tight whitespace-nowrap hidden min-[500px]:block">
              TaskFlow
            </span>
          </div>

          <div className="flex items-center min-w-0 flex-1 max-w-[124px] min-[360px]:max-w-[160px] min-[400px]:max-w-sm sm:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" size={13} />
              <input
                type="text"
                placeholder="Search tasks"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-surface-50 border border-surface-100 pl-8 pr-3 py-2 rounded-full text-[11px] sm:text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowProfilePanel(false);
              }}
              className={`p-1.5 sm:p-2 text-surface-500 hover:bg-surface-100 rounded-full transition-colors relative ${showNotifications ? "bg-surface-100" : ""}`}
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute top-[68px] sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:w-80 bg-white rounded-2xl shadow-2xl border border-surface-100 py-0 animate-in fade-in zoom-in duration-150 origin-top sm:origin-top-right z-50 overflow-hidden max-h-[80vh] sm:max-h-none flex flex-col">
                <div className="px-5 py-4 border-b border-surface-50 flex items-center justify-between bg-surface-50/30">
                  <span className="text-xs font-black text-surface-900 uppercase tracking-widest">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearNotifications}
                      className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest px-2 py-1 hover:bg-primary-50 rounded-md transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto overscroll-contain px-2 py-2 flex-1 scrollbar-hide">
                  {loadingNotifications ? (
                    <div className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-primary-500 mx-auto" />
                      <p className="text-[10px] text-surface-400 mt-3 font-black uppercase tracking-[0.2em]">Syncing Feed...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-1 pb-2">
                      {notifications.map((notification) => (
                        <div key={notification._id} className="px-4 py-3.5 hover:bg-surface-50 rounded-xl cursor-pointer transition-all border-b border-surface-50 last:border-0 group">
                          <p className="text-xs text-surface-800 font-bold leading-relaxed group-hover:text-primary-700">{notification.message}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 opacity-50">
                            <Clock size={10} className="text-surface-400" />
                            <span className="text-[9px] text-surface-400 font-bold uppercase tracking-tighter">
                              {new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="w-12 h-12 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-100 border-dashed">
                        <Bell size={20} className="text-surface-200" />
                      </div>
                      <span className="text-xs text-surface-400 font-black uppercase tracking-widest">Inbox Zero!</span>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-surface-50 bg-white sm:bg-surface-50/30">
                  <button
                    onClick={() => {
                      setActiveView("mytasks");
                      setShowNotifications(false);
                    }}
                    className="w-full py-3.5 sm:py-2.5 text-[10px] font-black text-white bg-surface-900 rounded-xl hover:bg-surface-800 transition-all uppercase tracking-[0.2em] shadow-lg"
                  >
                    View All History
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-surface-100 hidden min-[360px]:block" />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfilePanel((current) => !current);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-full border border-transparent px-1.5 py-1 hover:bg-surface-50 hover:border-surface-200 transition-colors"
            >
              <div className="flex flex-col text-right hidden min-[560px]:flex">
                <span className="text-xs font-bold text-surface-900 leading-none">{user?.name || "User"}</span>
                <span className="text-[10px] text-surface-500 mt-1">{user?.security?.twoFactorEnabled ? "Secured" : "Profile"}</span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-primary-500/20 flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold text-[10px] sm:text-xs">
                {initials}
              </div>
            </button>

            {showProfilePanel && (
              <div className="fixed sm:absolute top-[68px] sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:w-[22rem] bg-white rounded-[1.5rem] shadow-2xl border border-surface-100 p-4 sm:p-5 animate-in fade-in zoom-in duration-150 z-50">
                <div className="rounded-[1.25rem] border border-surface-100 bg-gradient-to-br from-primary-50 via-white to-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-500/20">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-600">Profile</p>
                      <p className="mt-2 text-base font-bold text-surface-900 break-words">{user?.name || "User"}</p>
                      <div className="mt-1 flex items-start gap-2 text-xs text-surface-500">
                        <Mail size={13} className="mt-0.5 shrink-0" />
                        <span className="break-all">{user?.email || "name@example.com"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Joined</p>
                      <p className="mt-2 text-sm font-semibold text-surface-900">{formatJoinedDate(user?.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Sign In</p>
                      <p className="mt-2 text-sm font-semibold text-surface-900">{loginMethodsLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${user?.security?.twoFactorEnabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    <ShieldCheck size={12} className="mr-1.5" />
                    {user?.security?.twoFactorEnabled ? "Authenticator On" : "Setup Needed"}
                  </span>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-surface-100 text-surface-600">
                    {user?.role === "admin" ? "Admin Account" : "Member Account"}
                  </span>
                </div>

                <p className="mt-4 text-xs text-surface-600">
                  Open your profile settings to edit your name, review security, and manage authenticator-backed password changes.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={openProfileSettings}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] bg-surface-900 text-white hover:bg-surface-800"
                  >
                    <Settings size={14} className="mr-2" />
                    Open Profile
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <LogOut size={14} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="hidden sm:inline-flex p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
