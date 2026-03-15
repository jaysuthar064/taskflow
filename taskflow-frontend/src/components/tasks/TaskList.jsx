import React from "react";
import TaskCard from "./TaskCard";
import { ListTodo, CheckSquare, Clock } from "lucide-react";

const TaskList = ({ tasks = [], onDelete, onToggle }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const pendingTasks = safeTasks.filter(t => !t.completed);
  const completedTasks = safeTasks.filter(t => t.completed);

  const Column = ({ title, icon, tasks, countColor }) => (
    <div className="flex flex-col w-full lg:w-80 bg-surface-100/50 rounded-lg border border-surface-200 p-3 h-fit min-h-[500px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold text-surface-600 uppercase tracking-wider">{title}</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-200 text-surface-600 font-bold">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="border border-dashed border-surface-300 rounded p-6 text-center">
            <p className="text-[10px] font-medium text-surface-400 uppercase tracking-widest">Empty</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onDelete={onDelete} onToggle={onToggle} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start pb-8">
      <Column 
        title="To Do" 
        icon={<ListTodo size={16} />} 
        tasks={pendingTasks} 
      />
      <Column 
        title="Completed" 
        icon={<CheckSquare size={16} />} 
        tasks={completedTasks} 
      />
    </div>
  );
};

export default TaskList;
