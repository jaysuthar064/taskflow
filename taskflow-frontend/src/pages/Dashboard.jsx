import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskForm from "../components/tasks/TaskForm";
import StatsCards from "../components/tasks/dashboard/StatsCard";
import TaskList from "../components/tasks/TaskList";
import TaskCollectionModal from "../components/tasks/TaskCollectionModal";
import LoadingScreen from "../components/common/LoadingScreen";
import API from "../api/axios";
import { LayoutGrid, Plus } from "lucide-react";
import MyTasksView from "../components/dashboard/MyTasksView";
import SettingsView from "../components/dashboard/SettingsView";
import ProductivityView from "../components/dashboard/ProductivityView";
import ReminderList from "../components/tasks/ReminderList";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useMobileScheduledReminders } from "../hooks/useMobileScheduledReminders";
import { getTaskCollectionKey, groupTasksByCollection } from "../components/tasks/taskCollections";
import Seo from "../components/common/Seo";

const getApiMessage = (error, fallback) => error.response?.data?.message || fallback;

const Dashboard = ({ installSettings }) => {
  const [tasks, setTasks] = useState([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollectionKey, setActiveCollectionKey] = useState("");
  const notificationSettings = usePushNotifications();

  const loadTasks = async ({ withLoader = false, canUpdate = () => true } = {}) => {
    if (!localStorage.getItem("token")) {
      if (canUpdate()) {
        setIsLoading(false);
      }
      return [];
    }

    if (withLoader && canUpdate()) {
      setIsLoading(true);
    }

    try {
      const response = await API.get("/tasks?all=true&sort=-createdAt");
      const taskList = response.data?.data ?? response.data?.tasks ?? [];
      const normalizedTasks = Array.isArray(taskList) ? taskList : [];

      if (canUpdate()) {
        setTasks(normalizedTasks);
      }

      return normalizedTasks;
    } catch (error) {
      console.error("Dashboard: Error fetching tasks", error);

      if (canUpdate()) {
        setTasks([]);
      }

      throw error;
    } finally {
      if (withLoader && canUpdate()) {
        setTimeout(() => {
          if (canUpdate()) {
            setIsLoading(false);
          }
        }, 800);
      }
    }
  };

  const matchesSearch = (task) =>
    String(task.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(task.description || "").toLowerCase().includes(searchQuery.toLowerCase());

  const filteredTasks = tasks.filter(matchesSearch);
  const reminderTasks = tasks
    .filter((task) => task.reminder && !task.completed)
    .sort((firstTask, secondTask) => new Date(firstTask.reminder) - new Date(secondTask.reminder));

  const allCollections = useMemo(() => groupTasksByCollection(tasks), [tasks]);
  const activeCollection = useMemo(
    () => allCollections.find((collection) => collection.id === activeCollectionKey) || null,
    [activeCollectionKey, allCollections]
  );

  useEffect(() => {
    if (activeCollectionKey && !activeCollection) {
      setActiveCollectionKey("");
    }
  }, [activeCollection, activeCollectionKey]);

  useMobileScheduledReminders({
    tasks,
    enabled: notificationSettings.permission === "granted"
  });

  const createTaskRecord = async ({ title, description, reminder, reminderRepeat, reminderWeekdays }) => {
    try {
      const response = await API.post("/tasks", {
        title,
        description,
        reminder,
        reminderRepeat,
        reminderWeekdays
      });
      const createdTask = response.data?.data ?? response.data?.task ?? null;

      if (!createdTask?._id) {
        throw new Error("Unable to create this card.");
      }

      setTasks((previousTasks) => [createdTask, ...previousTasks]);
      setStatsRefreshKey((previousKey) => previousKey + 1);
      return createdTask;
    } catch (error) {
      throw new Error(getApiMessage(error, "Unable to create this card."));
    }
  };

  const updateTaskRecord = async (taskId, updates, { refreshStats = false } = {}) => {
    try {
      const response = await API.patch(`/tasks/${taskId}`, updates);
      const updatedTask = response.data?.data ?? response.data?.task ?? null;

      if (!updatedTask?._id) {
        throw new Error("Unable to save this card item.");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );

      if (refreshStats) {
        setStatsRefreshKey((previousKey) => previousKey + 1);
      }

      return updatedTask;
    } catch (error) {
      throw new Error(getApiMessage(error, "Unable to save this card item."));
    }
  };

  const deleteTaskRecord = async (taskId, { refreshStats = true } = {}) => {
    const originalTasks = [...tasks];
    setTasks((previousTasks) => previousTasks.filter((task) => task._id !== taskId));

    if (refreshStats) {
      setStatsRefreshKey((previousKey) => previousKey + 1);
    }

    try {
      await API.delete(`/tasks/${taskId}`);
    } catch (error) {
      setTasks(originalTasks);

      if (refreshStats) {
        setStatsRefreshKey((previousKey) => previousKey - 1);
      }

      throw new Error(getApiMessage(error, "Unable to delete this card item."));
    }
  };

  const toggleTaskRecord = async (task) => {
    const originalTasks = [...tasks];
    setTasks((previousTasks) =>
      previousTasks.map((currentTask) =>
        currentTask._id === task._id ? { ...currentTask, completed: !task.completed } : currentTask
      )
    );
    setStatsRefreshKey((previousKey) => previousKey + 1);

    try {
      const response = await API.patch(`/tasks/${task._id}`, {
        completed: !task.completed
      });
      const updatedTask = response.data?.data ?? response.data?.task ?? null;

      if (!updatedTask?._id) {
        throw new Error("Unable to update this card item.");
      }

      setTasks((previousTasks) =>
        previousTasks.map((currentTask) => (currentTask._id === updatedTask._id ? updatedTask : currentTask))
      );

      return updatedTask;
    } catch (error) {
      setTasks(originalTasks);
      setStatsRefreshKey((previousKey) => previousKey - 1);
      throw new Error(getApiMessage(error, "Unable to update this card item."));
    }
  };

  const renameCollectionRecord = async (collection, nextTitle) => {
    try {
      const updatedTasks = await Promise.all(
        collection.tasks.map((task) =>
          API.patch(`/tasks/${task._id}`, {
            title: nextTitle
          }).then((response) => response.data?.data ?? response.data?.task ?? null)
        )
      );

      if (updatedTasks.some((task) => !task?._id)) {
        throw new Error("Unable to rename this card.");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) => updatedTasks.find((updatedTask) => updatedTask._id === task._id) || task)
      );

      setActiveCollectionKey(getTaskCollectionKey(nextTitle));
    } catch (error) {
      throw new Error(getApiMessage(error, "Unable to rename this card."));
    }
  };

  const deleteCollectionRecord = async (collection) => {
    const collectionTaskIds = new Set(collection.tasks.map((task) => task._id));
    const originalTasks = [...tasks];

    setTasks((previousTasks) => previousTasks.filter((task) => !collectionTaskIds.has(task._id)));
    setStatsRefreshKey((previousKey) => previousKey + collection.tasks.length);

    try {
      await Promise.all(collection.tasks.map((task) => API.delete(`/tasks/${task._id}`)));
    } catch (error) {
      setTasks(originalTasks);
      setStatsRefreshKey((previousKey) => previousKey - collection.tasks.length);
      throw new Error(getApiMessage(error, "Unable to delete this card."));
    }
  };

  const handleCreateTask = async (payload) => {
    const createdTask = await createTaskRecord(payload);
    setActiveCollectionKey(getTaskCollectionKey(createdTask.title));
    setIsTaskModalOpen(false);
    return createdTask;
  };

  const handleTaskCreated = async (newTask) => {
    if (!newTask?._id) {
      return;
    }

    setActiveCollectionKey(getTaskCollectionKey(newTask.title));
    setIsTaskModalOpen(false);
  };

  const handleToggleTask = async (task) => {
    try {
      await toggleTaskRecord(task);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) {
      return;
    }

    try {
      await deleteTaskRecord(taskId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteCollection = async (collection) => {
    const fullCollection = allCollections.find((existingCollection) => existingCollection.id === collection?.id) || collection;
    return deleteCollectionRecord(fullCollection);
  };

  const handleQuickAddItem = (payload) => createTaskRecord(payload);

  useEffect(() => {
    let isMounted = true;

    if (!localStorage.getItem("token")) {
      setIsLoading(false);
      return;
    }

    loadTasks({ withLoader: true, canUpdate: () => isMounted }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-surface-50 flex overflow-x-hidden">
      <Seo
        title="Dashboard | TaskFlow"
        description="Manage your TaskFlow workspace."
        path="/dashboard"
        robots="noindex,nofollow"
      />
      <Sidebar
        isOpen={isSidebarOpen}
        isHidden={false}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewTask={() => setIsTaskModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
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

        <main className="flex-1 p-2 min-[360px]:p-3 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full space-y-6">
            {activeView === "dashboard" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-surface-900 tracking-tight">Tasks</h1>
                    <nav className="flex items-center text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">
                      <span>Workspace</span>
                      <span className="mx-2">/</span>
                      <span className="text-primary-600">Cards</span>
                    </nav>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="btn-primary hidden sm:flex items-center shadow-sm rounded-2xl px-5 py-3"
                    >
                      <LayoutGrid size={16} className="mr-2" />
                      <span className="text-xs uppercase tracking-wider font-bold">New Card</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-surface-200 bg-white/80 p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-600">Quick Start</p>
                      <h2 className="mt-1 text-lg font-bold text-surface-900">Create a card, then open it to manage the items inside.</h2>
                      <p className="mt-1 text-sm text-surface-600">
                        Keep related work together and update everything from one place.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-2xl border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-bold text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Card
                    </button>
                  </div>
                </div>

                <div className="opacity-90">
                  <StatsCards refreshKey={statsRefreshKey} />
                </div>

                <div className="pt-2">
                  <TaskList
                    tasks={filteredTasks}
                    onOpenCollection={(collection) => setActiveCollectionKey(collection.id)}
                    onToggleTask={handleToggleTask}
                    onDeleteCollection={handleDeleteCollection}
                    onQuickAddItem={handleQuickAddItem}
                  />
                </div>
              </>
            )}

            {activeView === "mytasks" && (
              <MyTasksView
                tasks={filteredTasks}
                onOpenCollection={(collection) => setActiveCollectionKey(collection.id)}
                onToggleTask={handleToggleTask}
                onDeleteCollection={handleDeleteCollection}
                onQuickAddItem={handleQuickAddItem}
              />
            )}

            {activeView === "productivity" && <ProductivityView setActiveView={setActiveView} />}

            {activeView === "settings" && (
              <SettingsView
                notificationSettings={notificationSettings}
                installSettings={installSettings}
              />
            )}

            {activeView === "reminders" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-surface-900 tracking-tight">Upcoming Reminders</h2>
                  <p className="text-sm text-surface-500 mt-1">See upcoming reminder times for your open items.</p>
                </div>

                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                  <ReminderList
                    tasks={reminderTasks}
                    onDelete={handleDeleteTask}
                    onToggle={handleToggleTask}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[90] sm:hidden hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-white"
        title="Add New Card"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsTaskModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-200">
            <TaskForm
              onCreateTask={handleCreateTask}
              onTaskCreated={handleTaskCreated}
              onClose={() => setIsTaskModalOpen(false)}
            />
          </div>
        </div>
      )}

      {activeCollection && (
        <TaskCollectionModal
          collection={activeCollection}
          onClose={() => setActiveCollectionKey("")}
          onRenameCollection={renameCollectionRecord}
          onCreateCollectionItem={createTaskRecord}
          onUpdateCollectionItem={(taskId, updates) => updateTaskRecord(taskId, updates)}
          onDeleteCollectionItem={(taskId) => deleteTaskRecord(taskId)}
          onToggleCollectionItem={toggleTaskRecord}
          onDeleteCollection={deleteCollectionRecord}
        />
      )}
    </div>
  );
};

export default Dashboard;
