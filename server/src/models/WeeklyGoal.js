const mongoose = require('mongoose');

const goalItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const weeklyGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekStartDate: { type: String, required: true },
    weekEndDate: { type: String, required: true },
    goals: { type: [goalItemSchema], default: [] },
    reflection: { type: String, default: '' },
  },
  { timestamps: true }
);

weeklyGoalSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyGoal', weeklyGoalSchema);
