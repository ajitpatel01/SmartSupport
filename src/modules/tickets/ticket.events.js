import { inngest } from '../../inngest/client.js';

export async function emitTicketCreated(ticket) {
  await inngest.send({
    name: 'ticket/created',
    data: {
      ticketId: ticket._id.toString(),
      title: ticket.title,
      description: ticket.description,
      orgId: ticket.orgId.toString(),
      createdBy: ticket.createdBy.toString(),
    },
  });
}

export async function emitTicketResolved(ticket) {
  await inngest.send({
    name: 'ticket/resolved',
    data: {
      ticketId: ticket._id.toString(),
      title: ticket.title,
      orgId: ticket.orgId.toString(),
      createdBy: ticket.createdBy.toString(),
      assignedTo: ticket.assignedTo?.toString() ?? null,
    },
  });
}
