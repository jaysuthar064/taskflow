import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskForm from "../components/tasks/TaskForm";
import StatsCards from "../components/tasks/dashboard/StatsCard";
import TaskList from "../components/tasks/TaskList";
import LoadingScreen from "../components/common/LoadingScreen";
import API from "../api/axios";
import { Plus, X } from "lucide-react";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleTaskCreated = (newTask) => {
    if (!newTask) return;
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setStatsRefreshKey((prevKey) => prevKey + 1);
    setIsTaskModalOpen(false);
  }

  const handleToggleTask = async (task) => {
    try {
      const response = await API.patch(`/tasks/${task._id}`, {
        completed: !task.completed
      });

      const updatedTask = response.data?.data ?? response.data?.task ?? null;
      if (!updatedTask?._id) return;

      setTasks((prevTasks) =>
        prevTasks.map((t) => t._id === updatedTask._id ? updatedTask : t)
      );
      setStatsRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      alert(error.response?.data?.message || "Task Update Failed");
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      setStatsRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      alert("Error deleting task")
    }
  }

  useEffect(() => {
    let isMounted = true;
    
    // Safety check: if no token, don't hang
    if (!localStorage.getItem("token")) {
      console.log("Dashboard: No token found, stopping load");
      setIsLoading(false);
      return;
    }

    console.log("Dashboard: Fetching tasks...");
    API.get("/tasks")
      .then((response) => {
        console.log("Dashboard: Tasks fetched successfully");
        const taskList = response.data?.data ?? response.data?.tasks ?? [];
        if (isMounted) {
          setTasks(Array.isArray(taskList) ? taskList : []);
          setTimeout(() => {
            console.log("Dashboard: Setting isLoading to false");
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
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarHidden ? "ml-0" : "lg:ml-64"
      }`}>
        <Navbar onToggleSidebar={() => {
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(!isSidebarOpen);
          }
        }} />

        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          <div className="max-w-full space-y-6">
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
                className="btn-primary flex items-center shadow-sm"
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
              <TaskList tasks={tasks} onDelete={handleDeleteTask} onToggle={handleToggleTask} />
            </div>
          </div>
        </main>
      </div>

      {/* Modern Slide-over / Modal for Task Form */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
