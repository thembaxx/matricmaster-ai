export function toSentenceCase(str: string): string {
	if (!str) return str;
	const upperCaseRegex = /(?<!^)(?<!\s)(?=[A-Z])/g;
	const result = str.replace(upperCaseRegex, ' ');
	return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}

export function isSentenceCase(str: string): boolean {
	if (!str) return true;
	return str === toSentenceCase(str);
}
