import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, "Date is required (YYYY-MM-DD)"],
      index: true,
    },
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    project: {
      type: String,
      default: "",
      trim: true,
    },
    module: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed", "on-hold"],
      default: "todo",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

export const Task = mongoose.model("Task", taskSchema)
