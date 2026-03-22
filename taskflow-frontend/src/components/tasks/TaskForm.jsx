import React, { useMemo, useState } from "react";
import { Plus, X, AlignLeft, Type, Loader2, AlertCircle, LayoutGrid } from "lucide-react";
import TaskReminderFields from "./TaskReminderFields";
import {
    buildReminderPayload,
    getLocalMinReminder,
    toggleReminderWeekday
} from "./taskReminderUtils";

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 1200;

const TaskForm = ({ onCreateTask, onClose }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [reminder, setReminder] = useState("");
    const [reminderRepeat, setReminderRepeat] = useState("once");
    const [reminderWeekdays, setReminderWeekdays] = useState([]);
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const titleCharactersLeft = useMemo(() => TITLE_MAX_LENGTH - title.length, [title.length]);
    const descriptionCharactersLeft = useMemo(() => DESCRIPTION_MAX_LENGTH - description.length, [description.length]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            setFormError("Card title is required.");
            return;
        }

        if (trimmedTitle.length > TITLE_MAX_LENGTH) {
            setFormError(`Card title must be ${TITLE_MAX_LENGTH} characters or fewer.`);
            return;
        }

        if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
            setFormError(`First note must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`);
            return;
        }

        setIsLoading(true);

        try {
            const reminderPayload = buildReminderPayload({
                reminderValue: reminder,
                reminderRepeat,
                reminderWeekdays,
                requireFuture: Boolean(reminder)
            });

            await onCreateTask({
                title: trimmedTitle,
                description: trimmedDescription,
                ...reminderPayload
            });

            setTitle("");
            setDescription("");
            setReminder("");
            setReminderRepeat("once");
            setReminderWeekdays([]);

            if (onClose) {
                onClose();
            }
        } catch (error) {
            setFormError(error.message || "Task card creation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] border border-surface-200 bg-white shadow-2xl">
            <div className="border-b border-surface-100 bg-gradient-to-r from-primary-50 via-white to-amber-50 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex justify-between items-start gap-3">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-600">New Card</p>
                        <h2 className="mt-1 text-lg sm:text-xl font-bold text-surface-900 flex items-center">
                            <LayoutGrid className="mr-2 text-primary-600" size={22} />
                            Create Task Card
                        </h2>
                        <p className="mt-2 text-sm text-surface-600">
                            Add a title and the first item for this card.
                        </p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="rounded-full p-2 text-surface-400 hover:bg-white hover:text-surface-700 transition-colors flex-shrink-0">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
                {formError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                <div className="rounded-[1.5rem] border border-surface-200 bg-[#fffef8] p-4 shadow-sm">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-surface-700 ml-1 flex items-center">
                                <Type size={16} className="mr-2" />
                                Card Title
                            </label>
                            <input
                                type="text"
                                placeholder="Product launch, Study notes, Sprint ideas..."
                                className="input-field py-3 text-sm sm:text-base"
                                value={title}
                                onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX_LENGTH))}
                                maxLength={TITLE_MAX_LENGTH}
                                required
                            />
                            <div className="flex items-center justify-between gap-3 px-1 text-[11px]">
                                <p className="text-surface-500">This title will appear on the card.</p>
                                <span className={`font-semibold ${titleCharactersLeft < 15 ? "text-amber-600" : "text-surface-400"}`}>
                                    {titleCharactersLeft}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-surface-700 ml-1 flex items-center">
                                <AlignLeft size={16} className="mr-2" />
                                First Item
                            </label>
                            <textarea
                                placeholder="Write the first note, task detail, or checklist point..."
                                className="input-field min-h-[130px] resize-none py-3 text-sm"
                                value={description}
                                onChange={(event) => setDescription(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
                                maxLength={DESCRIPTION_MAX_LENGTH}
                            />
                            <div className="flex justify-end px-1">
                                <span className={`text-[11px] font-semibold ${descriptionCharactersLeft < 100 ? "text-amber-600" : "text-surface-400"}`}>
                                    {descriptionCharactersLeft}
                                </span>
                            </div>
                        </div>

                        <TaskReminderFields
                            reminderValue={reminder}
                            onReminderChange={setReminder}
                            reminderRepeat={reminderRepeat}
                            onReminderRepeatChange={(value) => {
                                setReminderRepeat(value);

                                if (value !== "weekly") {
                                    setReminderWeekdays([]);
                                }
                            }}
                            reminderWeekdays={reminderWeekdays}
                            onToggleWeekday={(weekdayValue) =>
                                setReminderWeekdays((currentWeekdays) => toggleReminderWeekday(currentWeekdays, weekdayValue))
                            }
                            min={getLocalMinReminder()}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3.5 text-sm sm:text-base shadow-xl shadow-primary-500/20 order-1 sm:order-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <Loader2 size={18} className="mr-2 animate-spin" />
                                <span>Creating Card...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <Plus size={18} className="mr-2" />
                                <span>Create Card</span>
                            </div>
                        )}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary w-full sm:w-auto px-6 py-3.5 order-2 sm:order-none"
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
