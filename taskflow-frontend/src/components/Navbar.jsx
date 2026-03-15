import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, Bell, Search, PanelLeftOpen } from "lucide-react";

const Navbar = ({ onToggleSidebar }) => {
  const { logout } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-surface-200 px-3 md:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            title="Menu"
          >
            <PanelLeftOpen size={20} />
          </button>
          
          {/* Mobile Logo "Out" */}
          <div className="flex items-center space-x-2 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-black text-xl tracking-tighter">T</span>
            </div>
            <span className="font-bold text-lg text-surface-900 tracking-tight whitespace-nowrap hidden min-[360px]:block">
              TaskFlow
            </span>
          </div>

          {/* Search Bar (Simulated) - Hidden on extra small mobile */}
          <div className="hidden sm:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-surface-50 border-none px-9 py-2 rounded-full text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 text-surface-500 hover:bg-surface-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-surface-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-semibold text-surface-900 leading-none">Jay Suthar</span>
                <span className="text-xs text-surface-500 mt-1">Workspace Admin</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary-500/20 flex items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold text-xs md:text-sm shadow-md">
              JS
            </div>
            <button 
                onClick={logout}
                className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
            >
              <LogOut size={18} md:size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
