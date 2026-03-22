import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface-50 px-4 animate-in fade-in duration-500">
      <div className="relative mb-6 sm:mb-8">
        {/* Animated Orbs */}
        <div className="absolute -inset-8 sm:-inset-10 bg-primary-500/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -inset-8 sm:-inset-10 bg-indigo-500/10 blur-3xl rounded-full animate-pulse delay-700"></div>
        
        {/* Logo/Icon */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-primary-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/40 animate-bounce cursor-wait">
          <span className="text-white font-bold text-3xl sm:text-4xl">T</span>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2 text-surface-900 font-bold text-lg sm:text-xl tracking-tight">
          <Loader2 className="animate-spin text-primary-600" size={20} />
          <span>TaskFlow Pro</span>
        </div>
        <p className="text-center text-surface-400 font-medium text-sm animate-pulse">
          Crafting your workspace...
        </p>
      </div>

      {/* Progress Bar (Visual Only) */}
      <div className="mt-10 sm:mt-12 w-40 sm:w-48 h-1.5 bg-surface-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 w-2/3 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
