import React from "react";
import { CheckCircle2, Circle, Clock, Trash2, Calendar } from "lucide-react";

const TaskCard = ({ task, onDelete, onToggle }) => {
  return (
    <div className="bg-white border border-surface-200 rounded p-3.5 shadow-sm hover:border-primary-400 transition-all group flex flex-col space-y-3">
      <div className="flex justify-between items-start gap-3">
        <h3 className={`text-sm font-semibold leading-snug transition-all ${
          task.completed ? "text-surface-400 line-through" : "text-surface-900"
        }`}>
          {task.title}
        </h3>
        <button
          onClick={() => onToggle(task)}
          className={`flex-shrink-0 mt-0.5 transition-colors ${
            task.completed ? "text-green-600" : "text-surface-300 hover:text-primary-500"
          }`}
        >
          {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
      </div>

      {task.description && (
        <p className={`text-xs leading-normal line-clamp-2 ${
          task.completed ? "text-surface-400" : "text-surface-500"
        }`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-[10px] font-medium text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded border border-surface-100">
            <Calendar size={10} className="mr-1" />
            <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
            TASK-{task._id?.slice(-4).toUpperCase() || "NEW"}
          </span>
        </div>

        <button
          onClick={() => onDelete(task._id)}
          className="p-1 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
