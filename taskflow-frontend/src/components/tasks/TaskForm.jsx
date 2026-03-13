import React, { useState } from "react";
import API from "../../api/axios";

const TaskForm = ({onTaskCreated}) => {
    const [title,setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
           const response =  await API.post("/tasks",{
                title,
                description
            });

            const createdTask = response.data?.data ?? response.data?.task ?? null;
            if (onTaskCreated) {
              onTaskCreated(createdTask);
            }
            setTitle("");
            setDescription("");

            alert("Task Created Successfully")
        }catch(error){
            alert(error.response?.data?.message || "Task Creation Failed");
        }
    }

    
  return (
     <div className="bg-white p-6 rounded-lg shadow ">

      <h2 className="text-xl font-semibold mb-4 ">
        Create Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Task Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Task Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
        type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
        >
          Create Task
        </button>

      </form>

    </div>
  );
};

export default TaskForm;
