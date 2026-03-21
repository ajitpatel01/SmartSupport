import { z } from 'zod';

export const analysisResultSchema = z.object({
  category: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  requiredSkills: z.array(z.string()),
  helpfulNotes: z.string(),
  confidence: z.number().min(0).max(1),
});
