const mongoose = require('mongoose');

const skillEntrySchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['technical', 'interpersonal'],
      required: true,
    },
  },
  { _id: false }
);

const dailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    tasksCompleted: { type: [String], default: [] },
    skillsPracticed: { type: [skillEntrySchema], default: [] },
    winsLog: { type: [String], default: [] },
    challenges: { type: String, default: '' },
    moodRating: { type: Number, min: 1, max: 5, default: null },
    followedUpOnTasks: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });
dailyLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
