import React, { useMemo } from "react";
import { CheckSquare, Layers3, ListTodo } from "lucide-react";
import TaskCard from "./TaskCard";
import { groupTasksByCollection } from "./taskCollections";

const TaskList = ({
  tasks = [],
  onOpenCollection,
  onToggleTask,
  onDeleteCollection,
  onQuickAddItem
}) => {
  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);
  const taskGroups = useMemo(() => groupTasksByCollection(safeTasks), [safeTasks]);

  const summaryCards = [
    {
      label: "Cards",
      value: taskGroups.length,
      icon: <Layers3 size={16} />,
      tone: "bg-sky-50 border-sky-100 text-sky-700"
    },
    {
      label: "Open Tasks",
      value: safeTasks.filter((task) => !task.completed).length,
      icon: <ListTodo size={16} />,
      tone: "bg-amber-50 border-amber-100 text-amber-700"
    },
    {
      label: "Completed",
      value: safeTasks.filter((task) => task.completed).length,
      icon: <CheckSquare size={16} />,
      tone: "bg-emerald-50 border-emerald-100 text-emerald-700"
    }
  ];

  if (safeTasks.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-surface-300 bg-white px-5 py-12 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-surface-400">No cards yet</p>
        <h3 className="mt-3 text-lg font-bold text-surface-900">Create your first task card.</h3>
        <p className="mt-2 text-sm text-surface-500 max-w-md mx-auto">
          Add a card to start organizing your tasks in one place.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="grid gap-3 min-[360px]:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ label, value, icon, tone }) => (
          <div key={label} className={`rounded-2xl border px-4 py-4 ${tone}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</p>
              {icon}
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-surface-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="columns-1 min-[700px]:columns-2 2xl:columns-3 gap-4 sm:gap-5">
        {taskGroups.map((taskGroup) => (
          <div key={taskGroup.id} className="mb-4 break-inside-avoid sm:mb-5">
            <TaskCard
              taskGroup={taskGroup}
              onOpenCollection={onOpenCollection}
              onToggleTask={onToggleTask}
              onDeleteCollection={onDeleteCollection}
              onQuickAddItem={onQuickAddItem}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
