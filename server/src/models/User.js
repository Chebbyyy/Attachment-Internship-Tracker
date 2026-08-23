const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    authProvider: { type: String, enum: ['local', 'google', 'linkedin'], default: 'local' },
    attachmentStartDate: { type: String, required: true },
    attachmentEndDate: { type: String, required: true },
    organization: { type: String, default: '', trim: true },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    hasPassword: Boolean(this.passwordHash),
    authProvider: this.authProvider,
    attachmentStartDate: this.attachmentStartDate,
    attachmentEndDate: this.attachmentEndDate,
    organization: this.organization,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
