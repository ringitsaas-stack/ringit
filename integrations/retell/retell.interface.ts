import { z } from 'zod';

// Zod schemas for validation
export const CreateAssistantParamsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  voiceId: z.string().min(1, 'Voice ID is required'),
});

export type CreateAssistantParams = z.infer<typeof CreateAssistantParamsSchema>;

export const UpdateAssistantParamsSchema = z.object({
  providerAgentId: z.string().min(1, 'Provider Agent ID is required'),
  prompt: z.string().optional(),
  model: z.string().optional(),
});

export type UpdateAssistantParams = z.infer<typeof UpdateAssistantParamsSchema>;

export interface AssistantDetails {
  providerAgentId: string;
}

export interface RegisterPhoneDetails {
  providerPhoneId: string;
}

export interface IRetellProvider {
  createAssistant(params: CreateAssistantParams): Promise<AssistantDetails>;
  updateAssistant(params: UpdateAssistantParams): Promise<void>;
  deleteAssistant(providerAgentId: string): Promise<void>;
  registerPhoneNumber(phoneNumber: string, providerAgentId: string): Promise<RegisterPhoneDetails>;
  cloneVoice(file: File, voiceName: string): Promise<string>;
}
