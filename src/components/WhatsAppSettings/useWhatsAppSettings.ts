'use client';

import { useCallback, useEffect, useState } from 'react';
import {
	cancelReminder,
	generateVerificationCode,
	getUserPreferences,
	updateReminderPreferences,
	verifyPhoneNumber,
} from '@/services/whatsapp-reminder-service';
import { sendVerificationCode } from '@/services/whatsapp-service';

export interface Message {
	type: 'success' | 'error';
	text: string;
}

export interface WhatsAppSettingsState {
	phoneNumber: string;
	verificationCode: string;
	isVerified: boolean;
	isOptedIn: boolean;
	isLoading: boolean;
	notificationTypes: string[];
	quietHoursStart: string;
	quietHoursEnd: string;
	reminderFrequency: string;
	showVerification: boolean;
	message: Message | null;
}

export function useWhatsAppSettings() {
	const [phoneNumber, setPhoneNumber] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [isVerified, setIsVerified] = useState(false);
	const [isOptedIn, setIsOptedIn] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [notificationTypes, setNotificationTypes] = useState<string[]>([]);
	const [quietHoursStart, setQuietHoursStart] = useState('22:00');
	const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
	const [reminderFrequency, setReminderFrequency] = useState('daily');
	const [showVerification, setShowVerification] = useState(false);
	const [message, setMessage] = useState<Message | null>(null);

	const _loadPreferences = useCallback(async () => {
		try {
			const userPrefs = await getUserPreferences('current-user');
			if (userPrefs) {
				setPhoneNumber(userPrefs.phoneNumber || '');
				setNotificationTypes(userPrefs.notificationTypes || []);
				setQuietHoursStart(userPrefs.quietHoursStart || '22:00');
				setQuietHoursEnd(userPrefs.quietHoursEnd || '08:00');
			}
		} catch (error) {
			console.error('Error loading preferences:', error);
		}
	}, []);

	useEffect(() => {
		_loadPreferences();
	}, [_loadPreferences]);

	async function handleSendCode() {
		if (!phoneNumber) return;

		setIsLoading(true);
		setMessage(null);
		try {
			const code = await generateVerificationCode('current-user');
			if (code) {
				await sendVerificationCode(phoneNumber, code);
				setShowVerification(true);
				setMessage({ type: 'success', text: 'Code sent to your WhatsApp!' });
			}
		} catch {
			setMessage({ type: 'error', text: 'Failed to send code' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleVerify() {
		if (!verificationCode || verificationCode.length !== 6) return;

		setIsLoading(true);
		setMessage(null);
		try {
			const isValid = await verifyPhoneNumber(phoneNumber, verificationCode);
			if (isValid) {
				setIsVerified(true);
				setMessage({ type: 'success', text: 'Phone verified successfully!' });
			} else {
				setMessage({ type: 'error', text: 'Invalid verification code' });
			}
		} catch {
			setMessage({ type: 'error', text: 'Verification failed' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleSavePreferences() {
		setIsLoading(true);
		try {
			await updateReminderPreferences('current-user', {
				notificationTypes,
				quietHoursStart,
				quietHoursEnd,
				frequency: reminderFrequency as 'daily' | 'weekly' | 'custom',
			});
			setMessage({ type: 'success', text: 'Preferences saved!' });
		} catch {
			setMessage({ type: 'error', text: 'Failed to save preferences' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleDisconnect() {
		setIsLoading(true);
		try {
			await cancelReminder('current-user');
			setIsOptedIn(false);
			setMessage({ type: 'success', text: 'WhatsApp disconnected' });
		} catch {
			setMessage({ type: 'error', text: 'Failed to disconnect' });
		} finally {
			setIsLoading(false);
		}
	}

	function handleNotificationToggle(typeId: string, enabled: boolean) {
		if (enabled) {
			setNotificationTypes([...notificationTypes, typeId]);
		} else {
			setNotificationTypes(notificationTypes.filter((t) => t !== typeId));
		}
	}

	return {
		phoneNumber,
		setPhoneNumber,
		verificationCode,
		setVerificationCode,
		isVerified,
		isOptedIn,
		setIsOptedIn,
		isLoading,
		notificationTypes,
		quietHoursStart,
		setQuietHoursStart,
		quietHoursEnd,
		setQuietHoursEnd,
		reminderFrequency,
		setReminderFrequency,
		showVerification,
		message,
		handleSendCode,
		handleVerify,
		handleSavePreferences,
		handleDisconnect,
		handleNotificationToggle,
	};
}
