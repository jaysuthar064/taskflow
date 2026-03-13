import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TaskForm from "../components/tasks/TaskForm";
import StatsCards from "../components/tasks/dashboard/StatsCard";
import TaskList from "../components/tasks/TaskList";
import API from "../api/axios";

const Dashboard = () => {
  const [tasks,setTasks] = useState([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  
  const handleTaskCreated = (newTask)=>{
    if (!newTask) return;
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setStatsRefreshKey((prevKey) => prevKey + 1);
  }

  const handleToggleTask = async (task)=>{
    try{
      const response = await API.patch(`/tasks/${task._id}`,{
        completed : !task.completed
      });

      const updatedTask = response.data?.data ?? response.data?.task ?? null;
      if (!updatedTask?._id) {
        return;
      }

      setTasks((prevTasks)=>
        prevTasks.map((t)=>
          t._id === updatedTask._id ? updatedTask : t
        )
      );
      setStatsRefreshKey((prevKey) => prevKey + 1);
    }catch(error){
      alert(error.response?.data?.message || "Task Update Failed");
    }
  }

  const handleDeleteTask = async (taskId)=>{
    try{
      await API.delete(`/tasks/${taskId}`);

      setTasks((prevTasks)=>prevTasks.filter((task)=>task._id !== taskId));
      setStatsRefreshKey((prevKey) => prevKey + 1);
    }catch(error){
      alert("Error deleting task",error)
    }
  }

  useEffect(() => {
    let isMounted = true;

    API.get("/tasks")
      .then((response) => {
        const taskList = response.data?.data ?? response.data?.tasks ?? [];
        if (isMounted) {
          setTasks(Array.isArray(taskList) ? taskList : []);
        }
      })
      .catch((error) => {
        console.error("Error fetching tasks", error);
        if (isMounted) {
          setTasks([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
     <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <StatsCards refreshKey={statsRefreshKey} />

        <TaskForm onTaskCreated={handleTaskCreated}/>

        <TaskList tasks={tasks} onDelete={handleDeleteTask} onToggle={handleToggleTask}/>

      </div>

    </div>
  );
};

export default Dashboard;
