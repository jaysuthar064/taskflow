import React from "react";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar, isHidden, hideSidebar, onNewTask }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: "Dashboard", active: true },
    { icon: <CheckCircle2 size={22} />, label: "My Tasks", active: false },
    { icon: <Settings size={22} />, label: "Settings", active: false },
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
        className={`fixed top-0 left-0 h-full glass-dark z-[70] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/20 shadow-2xl ${
          isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0 lg:w-[260px]"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header - Hidden on Mobile if sidebar is open to avoid double logo with Navbar */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-black text-2xl tracking-tighter">T</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight whitespace-nowrap overflow-hidden">
                TaskFlow
              </span>
            </div>
            
            {/* Collapse button ONLY on mobile */}
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-surface-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Close Menu"
            >
              <ChevronLeft size={22} />
            </button>
          </div>

          {/* Action Button */}
          <button 
            onClick={onNewTask}
            className="btn-primary mb-8 px-6 py-4 flex items-center justify-center transition-all shadow-xl shadow-primary-500/20 hover:scale-[1.02]"
          >
            <PlusCircle size={22} className="mr-2" />
            <span className="font-bold whitespace-nowrap text-base">New Task</span>
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center rounded-2xl p-4 transition-all duration-200 group relative ${
                  item.active 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30" 
                    : "text-surface-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="mr-4">{item.icon}</div>
                <span className="font-semibold text-base whitespace-nowrap transition-opacity duration-300">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
