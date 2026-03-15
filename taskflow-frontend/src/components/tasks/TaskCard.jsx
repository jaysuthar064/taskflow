import React from "react";
import { CheckCircle2, Circle, Clock, Trash2, Calendar } from "lucide-react";

const TaskCard = ({ task, onDelete, onToggle }) => {
  return (
    <div className="card group flex flex-col space-y-4 hover:border-primary-300 transition-all duration-300">
      <div className="flex justify-between items-start">
        <h3 className={`font-semibold text-lg leading-tight transition-all ${
          task.completed ? "text-surface-400 line-through" : "text-surface-900"
        }`}>
          {task.title}
        </h3>
        <button
          onClick={() => onToggle(task)}
          className={`flex-shrink-0 transition-colors ${
            task.completed ? "text-green-500" : "text-surface-300 hover:text-primary-500"
          }`}
        >
          {task.completed ? <CheckCircle2 size={24} fill="currentColor" className="text-green-50" /> : <Circle size={24} />}
        </button>
      </div>

      <p className={`text-sm leading-relaxed ${
        task.completed ? "text-surface-400" : "text-surface-500"
      }`}>
        {task.description || "No description provided."}
      </p>

      <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs font-medium">
          <div className="flex items-center text-surface-400">
            <Calendar size={14} className="mr-1" />
            <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          
          {/* Priority Badge (Simulated if not in backend) */}
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
            Medium
          </span>
        </div>

        <button
          onClick={() => onDelete(task._id)}
          className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          title="Delete Task"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
