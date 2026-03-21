import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditLogSchema = new Schema({
  ticketId: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  action: { type: String, required: true },
  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  meta: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ ticketId: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
