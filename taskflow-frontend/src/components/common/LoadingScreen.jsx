import React from "react";

const LoadingScreen = ({
  title = "TaskFlow",
  message = "Loading your workspace..."
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#202124]/96 px-4">
      <div
        className="flex w-full max-w-xs flex-col items-center rounded-[1.75rem] border border-white/10 bg-[#26282b] px-6 py-7 text-center shadow-[0_18px_48px_rgba(0,0,0,0.22)]"
        role="status"
        aria-live="polite"
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8ab4f8] text-xl font-bold text-[#202124] shadow-sm">
          T
        </div>

        <div className="mt-4 flex items-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8ab4f8] animate-[taskflow-dot_1s_ease-in-out_infinite]" />
          <span
            className="h-2.5 w-2.5 rounded-full bg-[#8ab4f8] animate-[taskflow-dot_1s_ease-in-out_infinite]"
            style={{ animationDelay: "0.14s" }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-[#8ab4f8] animate-[taskflow-dot_1s_ease-in-out_infinite]"
            style={{ animationDelay: "0.28s" }}
          />
        </div>

        <p className="mt-4 text-base font-semibold tracking-tight text-[#e8eaed]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#9aa0a6]">{message}</p>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full w-1/2 rounded-full bg-[#8ab4f8] animate-[taskflow-loading_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
