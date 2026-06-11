import { z } from 'zod';

export const createAgentSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry type is required'),
  tone: z.string().default('warm and friendly'),
  services: z.string().min(5, 'Services details are required to build agent context'),
  leadEmail: z.string().email('Invalid email address format'),
  areaCode: z.string().length(3, 'Area code must be exactly 3 digits').regex(/^\d+$/, 'Area code must contain numbers only').optional(),
});

export const updatePromptSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID format'),
  userMessage: z.string().min(3, 'Feedback prompt must be at least 3 characters'),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
