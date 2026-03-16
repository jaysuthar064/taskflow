import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, Bell, Search, PanelLeftOpen, Loader2, Clock } from "lucide-react";
import API from "../api/axios";

const Navbar = ({ onToggleSidebar, searchQuery, setSearchQuery, setActiveView }) => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

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

  React.useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-surface-200 px-3 md:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all lg:hidden"
            title="Menu"
          >
            <PanelLeftOpen size={18} />
          </button>
          
          {/* Mobile Logo "Out" - Hidden on very small screens to make room for search */}
          <div className="flex items-center space-x-2 lg:hidden hidden min-[400px]:flex">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-black text-lg tracking-tighter">T</span>
            </div>
            <span className="font-bold text-sm text-surface-900 tracking-tight whitespace-nowrap hidden min-[500px]:block">
              TaskFlow
            </span>
          </div>

          {/* Search Bar - Responsive */}
          <div className="flex items-center flex-1 max-w-[100px] min-[360px]:max-w-[120px] min-[400px]:max-w-md transition-all">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" size={12} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-50 border-none pl-7 sm:pl-8 pr-3 py-1.5 rounded-full text-[10px] sm:text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-1.5 sm:p-2 text-surface-500 hover:bg-surface-100 rounded-full transition-colors relative ${showNotifications ? 'bg-surface-100' : ''}`}
            >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute top-[70px] sm:top-full left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-surface-100 py-0 animate-in fade-in zoom-in duration-150 origin-top sm:origin-top-right z-50 overflow-hidden max-h-[80vh] sm:max-h-none flex flex-col">
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
                            {notifications.map(n => (
                                <div key={n._id} className="px-4 py-3.5 hover:bg-surface-50 rounded-xl cursor-pointer transition-all border-b border-surface-50 last:border-0 group">
                                    <p className="text-xs text-surface-800 font-bold leading-relaxed group-hover:text-primary-700">{n.message}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5 opacity-50">
                                        <Clock size={10} className="text-surface-400" />
                                        <span className="text-[9px] text-surface-400 font-bold uppercase tracking-tighter">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    className="w-full py-3.5 sm:py-2.5 text-[10px] font-black text-white bg-surface-900 rounded-xl sm:rounded-xl hover:bg-surface-800 transition-all uppercase tracking-[0.2em] shadow-lg mb-safe"
                  >
                    View All History
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-5 w-[1px] bg-surface-100 mx-0.5 hidden min-[320px]:block"></div>

          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <div className="flex flex-col text-right hidden min-[550px]:flex">
                <span className="text-xs font-bold text-surface-900 leading-none">{user?.name || "User"}</span>
                <span className="text-[10px] text-surface-500 mt-1">{user?.role === "admin" ? "Admin" : "Member"}</span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 min-[320px]:w-6 min-[320px]:h-6 lg:w-9 lg:h-9 rounded-full border border-primary-500/20 flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold text-[9px] sm:text-xs">
              {initials}
            </div>
            <button 
                onClick={logout}
                className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
