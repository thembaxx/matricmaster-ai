import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const DEFAULT_TIMEZONE = 'Africa/Johannesburg';

export function getBrowserTimezone(): string {
	if (typeof window === 'undefined') return DEFAULT_TIMEZONE;
	return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
}

export function toUserTime(date: Date | string, _timezone?: string): Date {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d;
}

export function toUTC(date: Date | string): Date {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Date(d.toISOString());
}

export function formatDateTimeLocal(
	date: Date | string,
	timezone?: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const tz = timezone || getBrowserTimezone();
	const d = typeof date === 'string' ? new Date(date) : date;
	const defaultOptions: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		month: 'short',
		weekday: 'short',
		...options,
	};
	return d.toLocaleString('en-ZA', { ...defaultOptions, timeZone: tz });
}

export function formatTimeOnly(date: Date | string, timezone?: string): string {
	const tz = timezone || getBrowserTimezone();
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleTimeString('en-ZA', {
		hour: 'numeric',
		minute: 'numeric',
		timeZone: tz,
	});
}

export function formatDateOnly(date: Date | string, timezone?: string): string {
	const tz = timezone || getBrowserTimezone();
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-ZA', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: tz,
	});
}

export function getTimezoneOffset(timezone: string): number {
	const now = new Date();
	const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
	const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
	return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

export function isValidTimezone(tz: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

export const COMMON_TIMEZONES = [
	{ value: 'UTC', label: 'UTC (GMT+0)', offset: 0 },
	{ value: 'Africa/Johannesburg', label: 'South Africa (GMT+2)', offset: 2 },
	{ value: 'Africa/Cairo', label: 'Egypt (GMT+2)', offset: 2 },
	{ value: 'Africa/Lagos', label: 'Nigeria (GMT+1)', offset: 1 },
	{ value: 'Africa/Nairobi', label: 'Kenya (GMT+3)', offset: 3 },
	{ value: 'Europe/London', label: 'London (GMT+0)', offset: 0 },
	{ value: 'Europe/Paris', label: 'Paris (GMT+1)', offset: 1 },
	{ value: 'Europe/Berlin', label: 'Berlin (GMT+1)', offset: 1 },
	{ value: 'America/New_York', label: 'New York (GMT-5)', offset: -5 },
	{ value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)', offset: -8 },
	{ value: 'America/Chicago', label: 'Chicago (GMT-6)', offset: -6 },
	{ value: 'Asia/Dubai', label: 'Dubai (GMT+4)', offset: 4 },
	{ value: 'Asia/Singapore', label: 'Singapore (GMT+8)', offset: 8 },
	{ value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)', offset: 9 },
	{ value: 'Australia/Sydney', label: 'Sydney (GMT+11)', offset: 11 },
];
