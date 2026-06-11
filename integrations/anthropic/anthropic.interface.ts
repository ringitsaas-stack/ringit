export interface LeadSummary {
  name: string;
  phone: string;
  intent: string;
  summary: string;
}

export interface IAnthropicProvider {
  summarizeLead(transcript: string): Promise<LeadSummary>;
}
