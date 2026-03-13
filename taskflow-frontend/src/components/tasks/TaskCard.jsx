import React from "react";

const TaskCard = ({ task , onDelete ,onToggle}) => {
  return (
    <div className="bg-white p-4 rounded shadow flex justify-between items-center">

      <div>

        <h3 className="font-semibold">
          {task.title}
        </h3>

        <p className="text-gray-500 text-sm">
          {task.description}
        </p>

      </div>

      <div>

        {task.completed ? (
          <span className="text-green-500 font-semibold">
            Completed
          </span>
        ) : (
          <span className="text-red-500 font-semibold">
            Pending
          </span>
        )}

        <button
          onClick={() => onToggle(task)}
          className={`px-3 py-1 rounded text-white ${
            task.completed
              ? "bg-green-500 hover:bg-green-600"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {task.completed ? "Completed" : "Mark Complete"}
        </button>

        <button
          onClick={() => onDelete(task._id)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>

      </div>

    </div>
  );
};

export default TaskCard;
