import React, { useContext } from "react";
import {
  Archive,
  Bell,
  ChevronLeft,
  PencilLine,
  Plus,
  StickyNote,
  Tag,
  Tags,
  Trash2
} from "lucide-react";
import { AuthContext } from "../context/auth-context";

const Sidebar = ({
  isMobileOpen,
  isCollapsed,
  onCloseMobile,
  activeSection,
  onChangeSection,
  labels = [],
  selectedLabel,
  onSelectLabel,
  onOpenLabelManager,
  onCreateNote
}) => {
  const { user } = useContext(AuthContext);

  const navItems = [
    { id: "notes", label: "Tasks", icon: StickyNote },
    { id: "reminders", label: "Reminders", icon: Bell },
    { id: "archive", label: "Archive", icon: Archive },
    { id: "trash", label: "Trash", icon: Trash2 }
  ];

  const sidebarWidthClass = isCollapsed ? "min-[900px]:w-20" : "min-[900px]:w-72";

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity min-[900px]:hidden ${
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[80] w-[min(18rem,calc(100vw-0.75rem))] overflow-x-hidden border-r border-white/10 bg-[#202124] shadow-[0_16px_40px_rgba(0,0,0,0.32)] transition-transform duration-250 min-[900px]:sticky min-[900px]:top-0 min-[900px]:inset-auto min-[900px]:left-auto min-[900px]:z-[50] min-[900px]:h-screen min-[900px]:w-auto min-[900px]:flex-shrink-0 min-[900px]:translate-x-0 min-[900px]:shadow-none ${sidebarWidthClass} ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className={`flex min-h-[76px] items-center justify-between border-b border-white/10 px-3.5 min-[360px]:px-4 sm:px-5 ${isCollapsed ? "min-[900px]:px-3" : ""}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? "min-[900px]:w-full min-[900px]:justify-center" : ""}`}>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ab4f8] text-lg font-bold text-[#202124]">
                T
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#e8eaed] min-[360px]:text-base">TaskFlow</p>
                  <p className="hidden truncate text-xs text-[#9aa0a6] min-[420px]:block">Plan, track, organize</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#9aa0a6] transition-colors hover:bg-[#303134] hover:text-[#e8eaed] min-[900px]:hidden"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 min-[360px]:py-5 sm:px-3">
            <button
              type="button"
              onClick={onCreateNote}
              className={`mb-5 inline-flex items-center justify-start rounded-full bg-[#feefc3] px-4 py-3 text-sm font-medium text-[#202124] shadow-sm transition-transform hover:scale-[1.01] min-[360px]:px-5 min-[360px]:py-3.5 ${
                isCollapsed ? "min-[900px]:w-full min-[900px]:justify-center min-[900px]:px-0" : "w-full"
              }`}
            >
              <Plus size={18} className={isCollapsed ? "" : "mr-3"} />
              {!isCollapsed && <span>New task</span>}
            </button>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id && !selectedLabel;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectLabel("");
                      onChangeSection(item.id);
                      onCloseMobile();
                    }}
                    className={`flex w-full items-center rounded-full px-4 py-3 text-sm font-medium transition-colors min-[360px]:px-5 ${
                      isActive
                        ? "bg-[#41331c] text-[#feefc3]"
                        : "text-[#e8eaed] hover:bg-[#303134]"
                    } ${isCollapsed ? "min-[900px]:justify-center min-[900px]:rounded-2xl min-[900px]:px-0" : ""}`}
                  >
                    <Icon size={18} className={isCollapsed ? "" : "mr-3"} />
                    {!isCollapsed && item.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onOpenLabelManager}
                className={`flex w-full items-center rounded-full px-4 py-3 text-sm font-medium text-[#e8eaed] transition-colors hover:bg-[#303134] min-[360px]:px-5 ${
                  isCollapsed ? "min-[900px]:justify-center min-[900px]:rounded-2xl min-[900px]:px-0" : ""
                }`}
              >
                <PencilLine size={18} className={isCollapsed ? "" : "mr-3"} />
                {!isCollapsed && "Edit labels"}
              </button>
            </nav>

            <div className="mt-6 border-t border-white/10 pt-5">
              {!isCollapsed && (
                <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6] min-[360px]:px-5">
                  Labels
                </p>
              )}

              <div className="space-y-1.5">
                {labels.map((label) => {
                  const isActive = selectedLabel.toLowerCase() === label.toLowerCase();

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        onChangeSection("notes");
                        onSelectLabel(label);
                        onCloseMobile();
                      }}
                      className={`flex w-full items-center rounded-full px-4 py-3 text-sm font-medium transition-colors min-[360px]:px-5 ${
                        isActive
                          ? "bg-[#1f3b5b] text-[#8ab4f8]"
                          : "text-[#e8eaed] hover:bg-[#303134]"
                      } ${isCollapsed ? "min-[900px]:justify-center min-[900px]:rounded-2xl min-[900px]:px-0" : ""}`}
                      title={label}
                    >
                      {isCollapsed ? (
                        <Tag size={18} />
                      ) : (
                        <>
                          <Tags size={18} className="mr-3" />
                          <span className="truncate">#{label}</span>
                        </>
                      )}
                    </button>
                  );
                })}

                {labels.length === 0 && !isCollapsed && (
                  <div className="mx-2 rounded-2xl border border-dashed border-[#5f6368] px-4 py-4 text-xs text-[#9aa0a6]">
                    Create labels to group related tasks.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-2 py-4 min-[360px]:px-3">
            <div className={`flex items-center rounded-2xl border border-white/10 bg-[#303134] px-3 py-3 ${isCollapsed ? "min-[900px]:justify-center min-[900px]:px-0" : ""}`}>
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8ab4f8] text-sm font-semibold text-[#202124]">
                {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
                <div className="ml-3 min-w-0">
                  <p className="truncate text-sm font-medium text-[#e8eaed]">{user?.name || "User"}</p>
                  <p className="truncate text-xs text-[#9aa0a6]">{user?.email || "name@example.com"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
