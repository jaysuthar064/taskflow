import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutGrid,
  List,
  Menu,
  Search,
  Settings,
  X
} from "lucide-react";
import { AuthContext } from "../context/auth-context";
import { NOTE_COLORS, SEARCH_FILTER_DEFINITIONS } from "./notes/noteUtils";

const Navbar = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  searchFilters,
  setSearchFilters,
  viewMode,
  setViewMode,
  onOpenSettings,
  searchInputRef
}) => {
  const { user, logout } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(searchQuery.trim()) ||
      Object.entries(searchFilters).some(([key, value]) =>
        key === "colors" ? value.length > 0 : Boolean(value)
      ),
    [searchFilters, searchQuery]
  );

  const toggleSearchFilter = (filterKey) => {
    setSearchFilters((currentFilters) => ({
      ...currentFilters,
      [filterKey]: !currentFilters[filterKey]
    }));
  };

  const toggleColorFilter = (colorValue) => {
    setSearchFilters((currentFilters) => ({
      ...currentFilters,
      colors: currentFilters.colors.includes(colorValue)
        ? currentFilters.colors.filter((currentColor) => currentColor !== colorValue)
        : [...currentFilters.colors, colorValue]
    }));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchFilters({
      reminders: false,
      lists: false,
      images: false,
      urls: false,
      drawings: false,
      colors: []
    });
    searchInputRef?.current?.focus();
  };

  const searchBar = (
    <div className="relative order-last basis-full min-w-0 min-[600px]:order-none min-[600px]:basis-auto min-[600px]:flex-1 min-[600px]:max-w-4xl">
      <div className="smooth-motion flex h-11 items-center rounded-full border border-[#5f6368] bg-[#303134] px-3.5 min-[360px]:px-4 min-[600px]:h-12">
        <Search size={18} className="mr-2.5 shrink-0 text-[#9aa0a6] min-[360px]:mr-3" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && hasActiveFilters) {
              event.preventDefault();
              clearSearch();
            }
          }}
          placeholder="Search tasks"
          className="w-full min-w-0 bg-transparent text-sm text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearSearch}
            className="smooth-motion smooth-lift inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#3c4043] hover:text-[#e8eaed]"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {(searchFocused || hasActiveFilters) && (
        <div className="smooth-panel absolute left-0 right-0 top-full z-20 mt-2 rounded-[1.25rem] border border-[#5f6368] bg-[#202124] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.45)] min-[360px]:rounded-[1.5rem] min-[360px]:p-4">
          <div className="flex flex-wrap gap-2">
            {SEARCH_FILTER_DEFINITIONS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleSearchFilter(filter.key)}
                className={`smooth-motion rounded-full border px-3 py-2 text-xs font-medium ${
                  searchFilters[filter.key]
                    ? "border-[#8ab4f8] bg-[#1f3b5b] text-[#8ab4f8]"
                    : "border-[#5f6368] text-[#e8eaed] hover:border-[#8ab4f8]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {NOTE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleColorFilter(color.value)}
            className={`smooth-motion h-8 w-8 rounded-full border hover:scale-105 ${
                  searchFilters.colors.includes(color.value)
                    ? "ring-2 ring-[#8ab4f8] ring-offset-2 ring-offset-[#202124]"
                    : ""
                }`}
                style={{ backgroundColor: color.fill, borderColor: color.border }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-[60] border-b border-white/10 bg-[#202124]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 min-[900px]:h-[76px] min-[900px]:flex-nowrap min-[900px]:px-6 min-[900px]:py-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="smooth-motion smooth-lift inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#303134] hover:text-[#e8eaed]"
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 min-[600px]:flex-none min-[900px]:hidden">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8ab4f8] font-bold text-[#202124]">
            T
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#e8eaed] min-[360px]:text-base">TaskFlow</p>
            <p className="hidden truncate text-xs text-[#9aa0a6] min-[420px]:block">Plan, track, organize</p>
          </div>
        </div>

        {searchBar}

        <div className="ml-auto flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 sm:gap-3">
          <div className="hidden items-center rounded-full border border-[#5f6368] bg-[#303134] p-1 sm:flex">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`smooth-motion smooth-lift inline-flex h-9 w-9 items-center justify-center rounded-full ${
                viewMode === "grid" ? "bg-[#8ab4f8] text-[#202124]" : "text-[#9aa0a6] hover:text-[#e8eaed]"
              }`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`smooth-motion smooth-lift inline-flex h-9 w-9 items-center justify-center rounded-full ${
                viewMode === "list" ? "bg-[#8ab4f8] text-[#202124]" : "text-[#9aa0a6] hover:text-[#e8eaed]"
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="smooth-motion smooth-lift inline-flex h-11 w-11 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-[#303134] hover:text-[#e8eaed]"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu((current) => !current)}
              className="smooth-motion smooth-lift inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#5f6368] bg-[#303134] text-sm font-semibold text-[#e8eaed] min-[360px]:h-11 min-[360px]:w-11"
              title="Profile"
            >
              {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
            </button>

            {showProfileMenu && (
              <div className="smooth-panel absolute right-0 top-full z-20 mt-2 w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.5rem] border border-[#5f6368] bg-[#202124] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9aa0a6]">Profile</p>
                <p className="mt-3 text-base font-medium text-[#e8eaed]">{user?.name || "User"}</p>
                <p className="mt-1 break-all text-sm text-[#9aa0a6]">{user?.email || "name@example.com"}</p>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setShowProfileMenu(false);
                    }}
                    className="smooth-motion smooth-lift rounded-full border border-[#5f6368] px-4 py-2 text-sm font-medium text-[#e8eaed] hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
                  >
                    Open settings
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="smooth-motion smooth-lift rounded-full border border-[#8c3c3c] px-4 py-2 text-sm font-medium text-[#f28b82] hover:bg-[#47292b]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
