import Ticket from '../../models/Ticket.js';
import AuditLog from '../../models/AuditLog.js';
import { ApiError } from '../../utils/ApiError.js';
import { applyCursor, formatCursorResult } from '../../utils/pagination.js';
import { emitTicketCreated, emitTicketResolved } from './ticket.events.js';

/**
 * Create a new ticket and fire the ticket/created Inngest event.
 */
export async function createTicket({ title, description, createdBy, orgId }) {
  const ticket = await Ticket.create({ title, description, createdBy, orgId });

  await AuditLog.create({
    ticketId: ticket._id,
    action: 'created',
    actor: createdBy,
  });

  await emitTicketCreated(ticket);
  return ticket;
}

/**
 * List tickets with optional filters and cursor-based pagination.
 */
export async function listTickets({ orgId, status, priority, assignedTo, category, cursor, limit }) {
  const filter = { orgId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (category) filter.category = category;

  const baseQuery = Ticket.find(filter);
  const { query, limit: effectiveLimit } = applyCursor(baseQuery, cursor, limit);
  const docs = await query.populate('createdBy', 'name email').populate('assignedTo', 'name email');

  return formatCursorResult(docs, effectiveLimit);
}

/**
 * Get a single ticket with its full audit log.
 */
export async function getTicketById(ticketId, orgId) {
  const ticket = await Ticket.findOne({ _id: ticketId, orgId })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');

  if (!ticket) throw ApiError.notFound('Ticket not found');

  const auditLog = await AuditLog.find({ ticketId })
    .sort({ timestamp: -1 })
    .populate('actor', 'name email');

  return { ...ticket.toObject(), auditLog };
}

/**
 * Update a ticket (status, priority, assignment) and append an audit entry.
 */
export async function updateTicket(ticketId, orgId, updates, actorId) {
  const ticket = await Ticket.findOne({ _id: ticketId, orgId });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const auditEntries = [];

  for (const [field, newValue] of Object.entries(updates)) {
    if (newValue !== undefined && ticket[field] !== newValue) {
      auditEntries.push({
        ticketId,
        action: `${field}_changed`,
        actor: actorId,
        meta: { oldValue: ticket[field], newValue },
      });
      ticket[field] = newValue;
    }
  }

  await ticket.save();
  if (auditEntries.length) await AuditLog.insertMany(auditEntries);

  if (updates.status === 'resolved') {
    await emitTicketResolved(ticket);
  }

  return ticket;
}

/**
 * Soft-delete a ticket (admin only).
 */
export async function deleteTicket(ticketId, orgId, actorId) {
  const ticket = await Ticket.findOne({ _id: ticketId, orgId });
  if (!ticket) throw ApiError.notFound('Ticket not found');

  ticket.deletedAt = new Date();
  await ticket.save();

  await AuditLog.create({
    ticketId,
    action: 'deleted',
    actor: actorId,
  });

  return ticket;
}
