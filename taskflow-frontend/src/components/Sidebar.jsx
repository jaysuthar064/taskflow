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
        className={`fixed top-0 left-0 h-full bg-surface-900 z-[70] transition-all duration-300 border-r border-surface-800 shadow-xl ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-surface-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                TaskFlow
              </span>
            </div>
            
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 text-surface-400 hover:text-white hover:bg-surface-800 rounded transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div className="p-4 flex flex-col h-full">
            {/* Action Button */}
            <button 
              onClick={onNewTask}
              className="btn-primary mb-6 w-full flex items-center justify-center py-2.5"
            >
              <PlusCircle size={18} className="mr-2" />
              <span className="font-semibold text-sm">New Task</span>
            </button>
  
            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center rounded-md px-3 py-2 transition-colors duration-150 ${
                    item.active 
                      ? "bg-primary-600/10 text-primary-400 font-semibold" 
                      : "text-surface-400 hover:bg-surface-800 hover:text-surface-100"
                  }`}
                >
                  <div className={`mr-3 ${item.active ? "text-primary-500" : "text-surface-500"}`}>
                    {React.cloneElement(item.icon, { size: 18 })}
                  </div>
                  <span className="text-sm">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
