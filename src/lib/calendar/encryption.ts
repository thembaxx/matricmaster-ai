import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

class EncryptionService {
	private key: Buffer | null = null;

	private async getKey(): Promise<Buffer> {
		if (!this.key) {
			const secret = process.env.ENCRYPTION_SECRET;
			if (!secret) {
				throw new Error('ENCRYPTION_SECRET environment variable is required');
			}
			this.key = (await scryptAsync(secret, 'salt', 32)) as Buffer;
		}
		return this.key!;
	}

	async encrypt(text: string): Promise<string> {
		const key = await this.getKey();
		const iv = randomBytes(IV_LENGTH);
		const cipher = createCipheriv(ALGORITHM, key, iv);

		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		const authTag = cipher.getAuthTag();

		// Combine iv + authTag + encrypted data
		const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
		return combined.toString('base64');
	}

	async decrypt(encryptedText: string): Promise<string> {
		const key = await this.getKey();
		const combined = Buffer.from(encryptedText, 'base64');

		if (combined.length < IV_LENGTH + TAG_LENGTH) {
			throw new Error('Invalid encrypted data');
		}

		const iv = combined.subarray(0, IV_LENGTH);
		const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
		const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(encrypted, undefined, 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	}
}

export const encryptionService = new EncryptionService();
