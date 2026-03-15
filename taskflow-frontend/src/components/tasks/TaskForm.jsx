import React, { useState } from "react";
import API from "../../api/axios";
import { Plus, X, AlignLeft, Type } from "lucide-react";

const TaskForm = ({ onTaskCreated, onClose }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await API.post("/tasks", { title, description });
            const createdTask = response.data?.data ?? response.data?.task ?? null;
            if (onTaskCreated) onTaskCreated(createdTask);
            setTitle("");
            setDescription("");
            if (onClose) onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Task Creation Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card glass p-4 sm:p-6 w-full max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-xl font-bold text-surface-900 flex items-center">
                    <Plus className="mr-2 text-primary-600" size={24} />
                    New Task
                </h2>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-full transition-colors text-surface-400">
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-surface-700 ml-1 flex items-center">
                        <Type size={16} className="mr-2" />
                        Title
                    </label>
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        className="input-field py-2.5 sm:py-3 text-base sm:text-lg"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-surface-700 ml-1 flex items-center">
                        <AlignLeft size={16} className="mr-2" />
                        Description
                    </label>
                    <textarea
                        placeholder="Add more details about this task..."
                        className="input-field min-h-[100px] sm:min-h-[120px] resize-none py-2.5 sm:py-3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3.5 sm:py-4 text-sm sm:text-base shadow-xl shadow-primary-500/20 order-1 sm:order-none"
                    >
                        {isLoading ? "Creating..." : "Create Task"}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary w-full sm:w-auto px-6 py-3.5 sm:py-4 order-2 sm:order-none"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
