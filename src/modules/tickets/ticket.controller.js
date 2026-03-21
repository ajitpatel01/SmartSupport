import * as ticketService from './ticket.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

/** POST /api/tickets — create a new ticket */
export const create = asyncWrapper(async (req, res) => {
  const ticket = await ticketService.createTicket({
    ...req.body,
    createdBy: req.user.userId,
    orgId: req.user.orgId,
  });
  ApiResponse.created(res, ticket);
});

/** GET /api/tickets — list with filters + cursor pagination */
export const list = asyncWrapper(async (req, res) => {
  const result = await ticketService.listTickets({
    orgId: req.user.orgId,
    ...req.query,
  });
  ApiResponse.paginated(res, result.data, {
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
});

/** GET /api/tickets/:id — single ticket + audit log */
export const getById = asyncWrapper(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id, req.user.orgId);
  ApiResponse.success(res, ticket);
});

/** PATCH /api/tickets/:id — update status/assignment */
export const update = asyncWrapper(async (req, res) => {
  const ticket = await ticketService.updateTicket(
    req.params.id,
    req.user.orgId,
    req.body,
    req.user.userId,
  );
  ApiResponse.success(res, ticket, 'Ticket updated');
});

/** DELETE /api/tickets/:id — soft delete (admin only) */
export const remove = asyncWrapper(async (req, res) => {
  await ticketService.deleteTicket(req.params.id, req.user.orgId, req.user.userId);
  ApiResponse.success(res, null, 'Ticket deleted');
});
