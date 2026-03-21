import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'escalation', 'resolution', 'welcome', 'system'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'webhook'],
      default: 'in_app',
    },
    payload: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
