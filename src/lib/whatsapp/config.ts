export function isWhatsAppConfigured(): boolean {
	const required = ['WHATSAPP_BUSINESS_ID', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'];
	const missing = required.filter((v) => !process.env[v]);
	if (missing.length > 0) {
		console.warn(`[WhatsApp] Missing config: ${missing.join(', ')}`);
		return false;
	}
	return true;
}
