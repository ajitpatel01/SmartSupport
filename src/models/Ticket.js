import mongoose from 'mongoose';

const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: { type: String, trim: true },
    skills: [String],
    aiNotes: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ticketSchema.index({ orgId: 1, status: 1 });
ticketSchema.index({ orgId: 1, assignedTo: 1 });
ticketSchema.index({ orgId: 1, deletedAt: 1, createdAt: -1 });

const softDeleteFilter = function (next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
};

ticketSchema.pre('find', softDeleteFilter);
ticketSchema.pre('findOne', softDeleteFilter);
ticketSchema.pre('countDocuments', softDeleteFilter);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
