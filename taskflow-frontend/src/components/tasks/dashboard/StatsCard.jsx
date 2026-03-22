import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { CheckCircle2, ListTodo, BarChart3 } from "lucide-react";

const StatCard = ({ title, value, icon, color, bgColor }) => (
    <div className="card flex items-center p-4 sm:p-6 space-x-4">
        <div className={`p-2.5 sm:p-3 rounded-xl ${bgColor} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs sm:text-sm font-medium text-surface-500">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-surface-900">{value}</p>
        </div>
    </div>
);

const StatsCards = ({ refreshKey = 0 }) => {
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
    });

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async () => {
            try {
                const response = await API.get("/tasks/stats");
                const data = response.data?.data ?? {};

                if (!isMounted) {
                    return;
                }

                setStats({
                    totalTasks: data.totalTasks ?? data.totalTask ?? 0,
                    completedTasks: data.completedTasks ?? data.completedTask ?? 0,
                    pendingTasks: data.pendingTasks ?? data.pendingTask ?? 0,
                });
            } catch (error) {
                console.error("Error Fetching Stats", error);
            }
        };

        fetchStats();

        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    return (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <StatCard 
                title="Total Tasks" 
                value={stats.totalTasks} 
                icon={<BarChart3 size={24} />} 
                color="text-primary-600"
                bgColor="bg-primary-50"
            />
            <StatCard 
                title="Completed" 
                value={stats.completedTasks} 
                icon={<CheckCircle2 size={24} />} 
                color="text-green-600"
                bgColor="bg-green-50"
            />
            <StatCard 
                title="To Do" 
                value={stats.pendingTasks} 
                icon={<ListTodo size={24} />} 
                color="text-orange-600"
                bgColor="bg-orange-50"
            />
        </div>
    );
};

export default StatsCards;
