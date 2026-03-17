import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ["task_created", "task_completed", "reminder_due", "system"],
    default: "system"
  }
}, {
  timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
