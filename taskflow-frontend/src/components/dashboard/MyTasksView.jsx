import React from "react";
import TaskList from "../tasks/TaskList";

const MyTasksView = ({ tasks, onOpenCollection, onToggleTask, onDeleteCollection, onQuickAddItem }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-surface-900 tracking-tight">My Tasks</h2>
        <p className="text-sm text-surface-500 mt-1">Use each card directly, or open it for full editing.</p>
      </div>
      
      <div className="bg-transparent">
        <TaskList
          tasks={tasks}
          onOpenCollection={onOpenCollection}
          onToggleTask={onToggleTask}
          onDeleteCollection={onDeleteCollection}
          onQuickAddItem={onQuickAddItem}
        />
      </div>
    </div>
  );
};

export default MyTasksView;
