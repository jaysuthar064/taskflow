import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskForm from "../components/tasks/TaskForm";
import StatsCards from "../components/tasks/dashboard/StatsCard";
import TaskList from "../components/tasks/TaskList";
import LoadingScreen from "../components/common/LoadingScreen";
import API from "../api/axios";
import { Plus, X } from "lucide-react";
import MyTasksView from "../components/dashboard/MyTasksView";
import SettingsView from "../components/dashboard/SettingsView";
import ProductivityView from "../components/dashboard/ProductivityView";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleTaskCreated = (newTask) => {
    if (!newTask) return;
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setStatsRefreshKey((prevKey) => prevKey + 1);
    setIsTaskModalOpen(false);
  }

  const handleToggleTask = async (task) => {
    // 1. Optimistically update local state
    const originalTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((t) => t._id === task._id ? { ...t, completed: !t.completed } : t)
    );
    setStatsRefreshKey((prevKey) => prevKey + 1);

    try {
      // 2. Sync with server
      const response = await API.patch(`/tasks/${task._id}`, {
        completed: !task.completed
      });

      const updatedTask = response.data?.data ?? response.data?.task ?? null;
      if (!updatedTask?._id) {
         // If response is invalid, fallback to local state sync
         return;
      }

      // 3. Final sync with server's source of truth
      setTasks((prevTasks) =>
        prevTasks.map((t) => t._id === updatedTask._id ? updatedTask : t)
      );
    } catch (error) {
      // 4. Rollback on failure
      setTasks(originalTasks);
      setStatsRefreshKey((prevKey) => prevKey - 1);
      alert(error.response?.data?.message || "Task Update Failed. Reverting changes.");
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;

    // 1. Optimistic Update
    const originalTasks = [...tasks];
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    setStatsRefreshKey((prevKey) => prevKey + 1);

    try {
      // 2. Server Sync
      await API.delete(`/tasks/${taskId}`);
    } catch (error) {
      // 3. Rollback
      setTasks(originalTasks);
      setStatsRefreshKey((prevKey) => prevKey - 1);
      alert("Error deleting task. Reverting changes.");
    }
  }

  useEffect(() => {
    let isMounted = true;
    
    // Safety check: if no token, don't hang
    if (!localStorage.getItem("token")) {
      setIsLoading(false);
      return;
    }

    API.get("/tasks")
      .then((response) => {
        const taskList = response.data?.data ?? response.data?.tasks ?? [];
        if (isMounted) {
          setTasks(Array.isArray(taskList) ? taskList : []);
          setTimeout(() => {
            setIsLoading(false);
          }, 800); // Smooth transition
        }
      })
      .catch((error) => {
        console.error("Dashboard: Error fetching tasks", error);
        if (isMounted) {
          setTasks([]);
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface-50 flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isHidden={isSidebarHidden}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        hideSidebar={() => setIsSidebarHidden(true)}
        onNewTask={() => setIsTaskModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarHidden ? "ml-0" : "lg:ml-64"
      }`}>
        <Navbar 
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(!isSidebarOpen);
            }
          }} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setActiveView={setActiveView}
        />

        <main className="flex-1 p-2 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full space-y-6">
            {activeView === "dashboard" && (
              <>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-surface-900 tracking-tight">Project Board</h1>
                    <nav className="flex items-center text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">
                      <span>Workspace</span>
                      <span className="mx-2">/</span>
                      <span className="text-primary-600">Active Tasks</span>
                    </nav>
                  </div>
                  <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="btn-primary hidden sm:flex items-center shadow-sm w-full sm:w-auto"
                  >
                    <Plus size={16} className="mr-2" />
                    <span className="text-xs uppercase tracking-wider font-bold">New Task</span>
                  </button>
                </div>

                {/* Stats Overview */}
                <div className="opacity-90">
                  <StatsCards refreshKey={statsRefreshKey} />
                </div>

                {/* Task List / Kanban */}
                <div className="pt-2">
                  <TaskList 
                    tasks={tasks.filter(t => 
                      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    )} 
                    onDelete={handleDeleteTask} 
                    onToggle={handleToggleTask} 
                  />
                </div>
              </>
            )}

            {activeView === "mytasks" && (
              <MyTasksView 
                tasks={tasks.filter(t => 
                  (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                )} 
                onDelete={handleDeleteTask} 
                onToggle={handleToggleTask} 
              />
            )}

            {activeView === "productivity" && <ProductivityView setActiveView={setActiveView} />}

            {activeView === "settings" && <SettingsView />}

            {activeView === "reminders" && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-surface-200">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                        <Bell size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-surface-900">Reminders</h2>
                    <p className="text-sm text-surface-500 mt-2 max-w-sm">
                        Smart reminders are coming soon to keep you on track with your deadlines!
                    </p>
                </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button (FAB) - Mobile Only */}
      <button 
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[90] sm:hidden hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-white"
        title="Add New Task"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Modern Slide-over / Modal for Task Form */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div 
            className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsTaskModalOpen(false)}
          />
          <div className="relative w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <TaskForm 
              onTaskCreated={handleTaskCreated} 
              onClose={() => setIsTaskModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
