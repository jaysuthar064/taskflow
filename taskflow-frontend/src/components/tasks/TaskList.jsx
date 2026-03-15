import React from "react";
import TaskCard from "./TaskCard";
import { ListTodo, CheckSquare, Clock } from "lucide-react";

const TaskList = ({ tasks = [], onDelete, onToggle }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const pendingTasks = safeTasks.filter(t => !t.completed);
  const completedTasks = safeTasks.filter(t => t.completed);

  const Column = ({ title, icon, tasks, countColor }) => (
    <div className="flex flex-col space-y-4 w-full lg:min-w-[320px] lg:flex-1">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <span className="text-surface-500">{icon}</span>
          <h2 className="font-bold text-surface-900">{title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${countColor}`}>
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center bg-surface-50/50">
            <p className="text-sm text-surface-400">No tasks here</p>
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
    <div className="flex flex-col lg:flex-row gap-10 items-start overflow-x-hidden">
      <Column 
        title="To Do" 
        icon={<ListTodo size={20} />} 
        tasks={pendingTasks} 
        countColor="bg-primary-100 text-primary-700"
      />
      <Column 
        title="Completed" 
        icon={<CheckSquare size={20} />} 
        tasks={completedTasks} 
        countColor="bg-green-100 text-green-700"
      />
    </div>
  );
};

export default TaskList;
