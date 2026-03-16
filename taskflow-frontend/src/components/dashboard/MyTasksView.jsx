import React from "react";
import TaskList from "../tasks/TaskList";

const MyTasksView = ({ tasks, onDelete, onToggle }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-surface-900 tracking-tight">My Personal Tasks</h2>
        <p className="text-sm text-surface-500 mt-1">Focus on what matters to you today.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-surface-200 p-0.5 sm:p-1">
        <TaskList tasks={tasks} onDelete={onDelete} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default MyTasksView;
