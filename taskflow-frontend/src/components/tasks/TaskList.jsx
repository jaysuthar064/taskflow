import TaskCard from "./TaskCard";

const TaskList = ({tasks = [] , onDelete ,onToggle }) => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    if(safeTasks.length === 0){
        return (
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-500">No tasks yet</p>
      </div>
    );
    }

    return (
        <div className="space-y-6">
            {safeTasks.map((task)=>(
                <TaskCard key={task._id} task ={task} onDelete={onDelete} onToggle={onToggle}/>
            ))}
        </div>
    )
};

export default TaskList;
