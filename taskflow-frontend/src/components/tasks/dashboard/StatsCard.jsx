import React, { useEffect, useState } from "react";
import API from "../../../api/axios";

const StatsCards = ({ refreshKey = 0 }) => {
    const [stats,setStats] = useState({
        totalTasks : 0,
        completedTasks : 0,
        pendingTasks : 0
    });

    const fetchStats = async()=>{
        try{
            const response = await API.get("/tasks/stats");
            const data = response.data?.data ?? {};
            setStats({
              totalTasks: data.totalTasks ?? data.totalTask ?? 0,
              completedTasks: data.completedTasks ?? data.completedTask ?? 0,
              pendingTasks: data.pendingTasks ?? data.pendingTask ?? 0,
            });
        }catch(error){
            console.error("Error Fetching Stats",error)
        }
    }

    useEffect(()=>{
        fetchStats()
    },[refreshKey]);

  return (
    <div className="grid grid-cols-3 gap-4">

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-500">Total Tasks</h3>
        <p className="text-2xl font-bold">
          {stats.totalTasks}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-500">Completed</h3>
        <p className="text-2xl font-bold text-green-500">
          {stats.completedTasks}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-500">Pending</h3>
        <p className="text-2xl font-bold text-red-500">
          {stats.pendingTasks}
        </p>
      </div>

    </div>
  );
};

export default StatsCards;
