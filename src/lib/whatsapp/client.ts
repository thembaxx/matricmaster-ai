export class WhatsAppClient {
	private phoneNumberId: string;
	private accessToken: string;
	private apiUrl: string;

	constructor() {
		this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
		this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
		this.apiUrl = 'https://graph.facebook.com/v18.0';
	}

	async sendMessage(to: string, message: string): Promise<void> {
		if (!this.accessToken || !this.phoneNumberId) {
			console.warn('WhatsApp not configured');
			return;
		}

		try {
			const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					to,
					type: 'text',
					text: { body: message },
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('WhatsApp send error:', error);
			}
		} catch (error) {
			console.error('WhatsApp error:', error);
		}
	}
}

export const whatsappClient = new WhatsAppClient();
