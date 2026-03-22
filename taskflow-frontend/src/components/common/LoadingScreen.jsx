import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#202124] px-4 animate-in fade-in duration-500">
      <div className="relative mb-6 sm:mb-8">
        <div className="absolute -inset-8 rounded-full bg-[#8ab4f8]/18 blur-3xl animate-pulse sm:-inset-10" />
        <div className="absolute -inset-8 rounded-full bg-[#feefc3]/10 blur-3xl animate-pulse delay-700 sm:-inset-10" />

        <div className="relative flex h-16 w-16 cursor-wait items-center justify-center rounded-[1.35rem] bg-[#8ab4f8] shadow-2xl shadow-[#8ab4f8]/30 sm:h-20 sm:w-20">
          <span className="text-3xl font-bold text-[#202124] sm:text-4xl">T</span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2 text-lg font-bold tracking-tight text-[#e8eaed] sm:text-xl">
          <Loader2 className="animate-spin text-[#8ab4f8]" size={20} />
          <span>TaskFlow Pro</span>
        </div>
        <p className="animate-pulse text-center text-sm font-medium text-[#9aa0a6]">
          Crafting your workspace...
        </p>
      </div>

      <div className="mt-10 h-1.5 w-40 overflow-hidden rounded-full bg-[#303134] sm:mt-12 sm:w-48">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#8ab4f8] to-[#feefc3] animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

export default LoadingScreen;
