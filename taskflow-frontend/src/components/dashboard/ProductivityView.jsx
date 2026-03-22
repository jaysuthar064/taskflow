import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Loader2, 
  BarChart3, 
  Zap, 
  Target, 
  Info,
  ArrowUpRight,
  Activity,
  Award
} from "lucide-react";
import API from "../../api/axios";

const MetricCard = ({ title, value, icon, subtitle, trend, colorClass }) => (
  <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${colorClass} opacity-5 rounded-full group-hover:scale-125 transition-transform duration-700`} />
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100 flex items-center justify-center shadow-inner`}>
          {React.cloneElement(icon, { size: 20 })}
      </div>
      {trend && (
          <span className="flex items-center text-[10px] font-black text-green-600 bg-green-50/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-100/50">
              <ArrowUpRight size={10} className="mr-0.5" />
              {trend}
          </span>
      )}
    </div>
    <div className="mt-5 relative z-10">
      <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-3xl font-black text-surface-900 mt-1.5 tracking-tighter">{value}</p>
      <p className="text-[10px] text-surface-500 mt-1.5 font-bold uppercase tracking-wider opacity-70">{subtitle}</p>
    </div>
  </div>
);

const ProductivityView = ({ setActiveView }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          API.get("/productivity-stats"),
          API.get("/tasks")
        ]);
        
        setStats(statsRes.data.data || []);
        
        // Transform tasks into activity events
        const taskList = tasksRes.data.data || tasksRes.data.tasks || [];
        const events = [];
        
        taskList.forEach(task => {
          // Add creation event
          events.push({
            id: `${task._id}-created`,
            type: "created",
            title: task.title,
            time: new Date(task.createdAt),
            timestamp: task.createdAt
          });
          
          // Add completion event if completed
          if (task.completed) {
            events.push({
              id: `${task._id}-completed`,
              type: "completed",
              title: task.title,
              time: new Date(task.updatedAt),
              timestamp: task.updatedAt
            });
          }
        });

        // Sort by most recent first
        setActivities(events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30));
        
      } catch (error) {
        console.error("Error fetching productivity data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calculations
  const totalCompleted = stats.reduce((acc, curr) => acc + curr.completed, 0);
  const totalCreated = stats.reduce((acc, curr) => acc + curr.created, 0);
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;
  
  const mostProductiveDay = [...stats].sort((a, b) => b.completed - a.completed)[0];
  const avgCompleted = Math.round((totalCompleted / 7) * 10) / 10;
  
  // Custom Productivity Score (Logic: Consistency * Volume)
  const nonZeroDays = stats.filter(s => s.completed > 0).length;
  // Revised Productivity Score Algorithm (Strict: Rewards volume, consistency, and efficiency)
  const volumePoints = totalCompleted * 1; // 1 point per task
  const consistencyPoints = nonZeroDays * 5; // Max 35 points
  const efficiencyPoints = totalCreated > 0 ? (totalCompleted / totalCreated) * 15 : 0; // Max 15 points
  const productivityScore = Math.min(100, Math.round(volumePoints + consistencyPoints + efficiencyPoints));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header with Glassmorphism Score */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-xl w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-surface-900 tracking-tight">
              Performance Insights
            </h2>
            <div className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] rounded-md font-black uppercase whitespace-nowrap">Alpha Analytics</div>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-2 leading-relaxed max-w-md sm:max-w-none">
            Real-time analysis of your workflow patterns. We use advanced metrics to visualize your project velocity and daily consistency.
          </p>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
             <div className="w-full sm:w-auto bg-white/80 backdrop-blur-xl px-3 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-xl border border-white/40 flex items-center justify-center sm:justify-start gap-4 min-w-0 sm:min-w-[220px] relative overflow-hidden group">
                {productivityScore > 80 && (
                    <div className="absolute inset-0 bg-primary-500/5 animate-pulse transition-opacity" />
                )}
                <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-surface-100/50" />
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            style={{ strokeDasharray: 151, strokeDashoffset: 151 - (151 * productivityScore) / 100 }}
                            className="text-primary-600 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(var(--primary-600-rgb),0.4)]" 
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] sm:text-xs font-black text-surface-900 leading-none mb-0.5">{productivityScore}</span>
                    </div>
                </div>
                <div className="relative z-10 flex-1">
                    <span className="text-[8px] sm:text-[9px] font-black text-surface-400 uppercase tracking-widest block">Productivity Score</span>
                    <span className={`text-[10px] sm:text-xs font-black flex items-center mt-1 ${productivityScore > 80 ? 'text-primary-600' : 'text-green-600'}`}>
                        <Zap size={10} className={`mr-1 ${productivityScore > 80 ? 'animate-bounce' : ''}`} />
                        {productivityScore > 80 ? 'Elite Velocity' : 'Dynamic Flow'}
                    </span>
                </div>
             </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-surface-200 border-dashed">
            <div className="relative">
                <Loader2 size={48} className="animate-spin text-primary-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={16} className="text-primary-600 animate-pulse" />
                </div>
            </div>
            <p className="text-sm text-surface-400 font-bold mt-6 uppercase tracking-widest">Crunching your data...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
                title="Completion Rate" 
                value={`${completionRate}%`} 
                icon={<Target />} 
                subtitle="Tasks completed vs created"
                colorClass="bg-blue-600 text-blue-600"
            />
            <MetricCard 
                title="Weekly Velocity" 
                value={totalCompleted} 
                icon={<Activity />} 
                subtitle="Total tasks finished"
                colorClass="bg-primary-600 text-primary-600"
            />
            <MetricCard 
                title="Peak Intensity" 
                value={mostProductiveDay?.day || "N/A"} 
                icon={<Award />} 
                subtitle={`${mostProductiveDay?.completed || 0} tasks finished`}
                colorClass="bg-indigo-600 text-indigo-600"
            />
            <MetricCard 
                title="Avg Daily Flow" 
                value={avgCompleted} 
                icon={<Activity />} 
                subtitle="Completed per day"
                colorClass="bg-teal-600 text-teal-600"
            />
          </div>

          {/* Main Analytics Chart */}
          <div className="bg-white/80 backdrop-blur-md p-5 sm:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-5 sm:p-8 hidden sm:block">
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-500-rgb),0.5)]" />
                        <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-surface-200/50" />
                        <span className="text-[9px] font-black text-surface-500 uppercase tracking-widest">Input</span>
                    </div>
                 </div>
            </div>
            
            <div className="mb-8 sm:mb-12">
                <h3 className="text-sm font-black text-surface-900 flex items-center uppercase tracking-tight">
                    <BarChart3 size={18} className="mr-2 text-primary-500" />
                    Workflow Equilibrium
                </h3>
                <p className="text-[10px] sm:text-xs text-surface-400 mt-1 font-bold uppercase tracking-widest opacity-60">Last 7 cycle efficiency analysis</p>
            </div>
            
            <div className="flex items-end justify-between h-48 sm:h-64 gap-2 sm:gap-6 px-1 sm:px-4 mt-4">
                {stats.map((day, i) => {
                    const maxVal = Math.max(...stats.map(s => Math.max(s.completed, s.created, 1)));
                    const compHeight = (day.completed / maxVal) * 100;
                    const createHeight = (day.created / maxVal) * 100;
                    
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                            <div className="relative w-full flex justify-center items-end h-full gap-0.5 sm:gap-1.5">
                                {/* Input Bar */}
                                <div 
                                    style={{ height: `${createHeight}%` }}
                                    className="w-1.5 sm:w-2 lg:w-3 bg-surface-100/50 rounded-t-full transition-all duration-700 opacity-40 group-hover:opacity-60"
                                />
                                {/* Completed Bar */}
                                <div 
                                    style={{ height: `${compHeight}%` }}
                                    className="w-2 sm:w-3 lg:w-5 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-full transition-all duration-1000 group-hover:brightness-110 group-hover:scale-x-110 relative shadow-[0_0_20px_rgba(var(--primary-600-rgb),0.1)]"
                                >
                                    {day.completed > 0 && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 bg-surface-900/90 backdrop-blur-md text-white text-[8px] font-black px-2 py-1.5 rounded-lg shadow-2xl z-20 whitespace-nowrap border border-white/10 uppercase tracking-tighter">
                                            {day.completed} Done
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-surface-50 w-full text-center">
                                <span className="text-[8px] sm:text-[10px] font-black text-surface-300 group-hover:text-primary-600 transition-all uppercase tracking-[0.15em] origin-center">
                                    {day.day.substring(0, 3)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          {/* Logic Explanation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-surface-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <TrendingUp size={180} className="absolute -right-8 -bottom-8 text-white/5 rotate-6 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center">
                            <Info size={18} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight">How we calculate your flow</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Productivity Score</h4>
                            <p className="text-xs text-surface-300 leading-relaxed font-medium">
                                A weighted algorithm combining **Volume** (tasks completed) and **Consistency** (non-zero active days). A perfect score of 100 requires high output across all 7 days.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Workflow Equilibrium</h4>
                            <p className="text-xs text-surface-300 leading-relaxed font-medium">
                                We compare **Input** (tasks created) vs **Output** (tasks completed). True productivity isn't just finishing tasks; it's clearing your backlog faster than you build it.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-surface-400 uppercase">Your personal productivity hub</span>
                    </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col justify-between group">
                <div>
                    <h3 className="text-lg font-black leading-tight uppercase tracking-tight">Maximize your Output</h3>
                    <p className="text-xs text-white/80 mt-3 leading-relaxed font-medium">
                        Focus on maintaining your **{productivityScore > 50 ? 'Elite' : 'Steady'} Velocity** by completing tasks consistently across the week.
                    </p>
                </div>
                <button 
                    onClick={() => setShowActivityLog(true)}
                    className="w-full mt-8 py-3 bg-white text-primary-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface-50 transition-all transform group-hover:translate-y-[-2px] shadow-lg"
                >
                    Check Detailed Log
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Activity Log Slide-over */}
      {showActivityLog && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
                className="absolute inset-0 bg-surface-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-500" 
                onClick={() => setShowActivityLog(false)}
            />
            <div className="relative w-full sm:max-w-md bg-white h-full shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-700 overflow-hidden flex flex-col border-l border-white/20">
                <div className="p-8 border-b border-surface-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
                    <div>
                        <h3 className="text-xl font-black text-surface-900 uppercase tracking-tight">Activity Log</h3>
                        <p className="text-[10px] text-primary-500 font-black uppercase tracking-[0.2em] mt-1">Chronological history</p>
                    </div>
                    <button 
                        onClick={() => setShowActivityLog(false)}
                        className="p-3 bg-surface-50 hover:bg-surface-100 rounded-2xl transition-all active:scale-90"
                    >
                        <ArrowUpRight size={20} className="rotate-45 text-surface-900" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-10 scrollbar-hide">
                    {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center text-surface-200 mb-6 border border-surface-100 border-dashed">
                                <Activity size={36} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest">Awaiting activity...</p>
                        </div>
                    ) : (
                        activities.map((activity, idx) => (
                            <div key={activity.id} className="relative pl-10">
                                {/* Timeline Line */}
                                {idx !== activities.length - 1 && (
                                    <div className="absolute left-4 top-8 bottom-[-2.5rem] w-[1px] bg-gradient-to-b from-surface-200 to-transparent" />
                                )}
                                
                                {/* Timeline Dot */}
                                <div className={`absolute left-0 top-1 w-8 h-8 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
                                    activity.type === 'completed' ? 'bg-green-500' : 'bg-primary-500 shadow-primary-500/20'
                                }`}>
                                    {activity.type === 'completed' ? <CheckCircle size={12} className="text-white" /> : <Zap size={12} className="text-white" />}
                                </div>

                                <div className="animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${
                                            activity.type === 'completed' ? 'text-green-600' : 'text-primary-600'
                                        }`}>
                                            Task {activity.type}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-surface-400 font-bold text-[9px] tracking-tight">
                                            <Calendar size={10} className="opacity-50" />
                                            {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-black text-surface-900 mt-2 leading-tight pr-4">{activity.title}</h4>
                                    <p className="text-[10px] text-surface-400 mt-1 font-bold uppercase tracking-widest">
                                        {activity.time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 border-t border-surface-100 bg-white/50 backdrop-blur-md">
                    <button 
                        onClick={() => {
                            setShowActivityLog(false);
                            setActiveView("mytasks");
                        }}
                        className="w-full py-4 bg-surface-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-800 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        View Full History
                        <ArrowUpRight size={14} className="opacity-50" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityView;
