import React, { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Settings, 
  ChevronLeft, 
  PlusCircle,
  BarChart3,
  LogOut,
  Bell
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, isHidden, onNewTask, activeView, setActiveView }) => {
  const { user, logout } = useContext(AuthContext);
  
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const menuItems = [
    { id: "dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
    { id: "mytasks", icon: <CheckCircle2 size={22} />, label: "My Tasks" },
    { id: "productivity", icon: <BarChart3 size={22} />, label: "Productivity" },
    { id: "reminders", icon: <Bell size={22} />, label: "Reminders" },
    { id: "settings", icon: <Settings size={22} />, label: "Settings" },
  ];

  if (isHidden) return null;

  return (
    <>
      {/* Sidebar Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-surface-900 z-[70] transition-all duration-300 border-r border-surface-800 shadow-xl ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-surface-800">
            <button 
              onClick={() => setActiveView("dashboard")}
              className="flex items-center space-x-2 sm:space-x-3 group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg sm:text-xl">T</span>
              </div>
              <span className="font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-primary-400 transition-colors">
                TaskFlow
              </span>
            </button>
            
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 text-surface-400 hover:text-white hover:bg-surface-800 rounded transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            {/* Action Button */}
            <button 
              onClick={onNewTask}
              className="btn-primary mb-6 w-full hidden lg:flex items-center justify-center py-2.5"
            >
              <PlusCircle size={18} className="mr-2" />
              <span className="font-semibold text-sm">New Task</span>
            </button>
  
            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`w-full flex items-center rounded-md px-3 py-2 transition-colors duration-150 ${
                    activeView === item.id 
                      ? "bg-primary-600/10 text-primary-400 font-semibold" 
                      : "text-surface-400 hover:bg-surface-800 hover:text-surface-100"
                  }`}
                >
                  <div className={`mr-3 ${activeView === item.id ? "text-primary-500" : "text-surface-500"}`}>
                    {React.cloneElement(item.icon, { size: 18 })}
                  </div>
                  <span className="text-sm">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Sidebar Profile/Footer */}
            <div className="mt-auto pt-4 border-t border-surface-800">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800/50 border border-surface-700/50">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface-700">
                            {initials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user?.name || "User"}</p>
                            <p className="text-[10px] text-surface-500 truncate capitalize">{user?.role || "Member"}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
