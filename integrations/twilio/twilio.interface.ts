import { z } from 'zod';

export interface PhoneDetails {
  sid: string;
  phoneNumber: string;
}

export interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
}

export const SendSMSParamsSchema = z.object({
  to: z.string().min(1, 'Recipient phone number (to) is required'),
  from: z.string().min(1, 'Sender phone number (from) is required'),
  message: z.string().min(1, 'Message body is required'),
});

export type SendSMSParams = z.infer<typeof SendSMSParamsSchema>;

export interface TwilioMessageResponse {
  sid: string;
  body: string;
  to: string;
  from: string;
}

export interface ITwilioProvider {
  searchAvailableNumbers(countryCode?: string, areaCode?: string): Promise<AvailableNumber[]>;
  purchaseNumber(phoneNumber: string): Promise<PhoneDetails>;
  configureVoiceWebhook(phoneSid: string, webhookUrl: string): Promise<void>;
  sendSMS(params: SendSMSParams): Promise<TwilioMessageResponse>;
}
