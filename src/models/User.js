import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    skills: [{ type: String, trim: true }],
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

const User = mongoose.model('User', userSchema);
export default User;
