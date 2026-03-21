import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
});

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedTo: z.string().optional(),
  category: z.string().optional(),
});

export const ticketQuerySchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedTo: z.string().optional(),
  category: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});
