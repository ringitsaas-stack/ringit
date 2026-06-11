import twilio from 'twilio';
import { ITwilioProvider, AvailableNumber, PhoneDetails, SendSMSParams, SendSMSParamsSchema, TwilioMessageResponse } from './twilio.interface';

export class TwilioProvider implements ITwilioProvider {
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variables.');
    }

    this.client = twilio(accountSid, authToken);
  }

  async searchAvailableNumbers(areaCode?: string): Promise<AvailableNumber[]> {
    try {
      const searchOptions: { limit: number; areaCode?: number } = { limit: 5 };
      if (areaCode && areaCode.trim().length === 3) {
        searchOptions.areaCode = Number(areaCode);
      }

      const available = await this.client
        .availablePhoneNumbers('US')
        .local.list(searchOptions);

      return available.map((number) => ({
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
      }));
    } catch (error) {
      console.error('Twilio search error:', error);
      throw new Error(`Failed to search available numbers: ${error instanceof Error ? error.message : 'Search failed'}`);
    }
  }

  async purchaseNumber(phoneNumber: string): Promise<PhoneDetails> {
    try {
      const purchased = await this.client.incomingPhoneNumbers.create({
        phoneNumber,
      });

      return {
        sid: purchased.sid,
        phoneNumber: purchased.phoneNumber,
      };
    } catch (error) {
      console.error('Twilio purchase error:', error);
      throw new Error(`Failed to purchase Twilio phone number: ${error instanceof Error ? error.message : 'Purchase failed'}`);
    }
  }

  async configureVoiceWebhook(phoneSid: string, webhookUrl: string): Promise<void> {
    try {
      await this.client.incomingPhoneNumbers(phoneSid).update({
        voiceUrl: webhookUrl,
        voiceMethod: 'POST',
      });
    } catch (error) {
      console.error('Twilio configuration error:', error);
      throw new Error(`Failed to configure Twilio voice webhook: ${error instanceof Error ? error.message : 'Configuration failed'}`);
    }
  }

  async sendSMS(params: SendSMSParams): Promise<TwilioMessageResponse> {
    try {
      const validated = SendSMSParamsSchema.parse(params);
      const { to, from, message } = validated;

      const response = await this.client.messages.create({
        body: message,
        to,
        from,
      });
      
      return {
        sid: response.sid,
        body: response.body,
        to: response.to,
        from: response.from
      };
    } catch (error) {
      console.error('Twilio SMS send error:', error);
      throw new Error(`Failed to dispatch Twilio SMS: ${error instanceof Error ? error.message : 'SMS send failed'}`);
    }
  }
}
