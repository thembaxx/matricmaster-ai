/**
 * Generate a unique paper ID from past paper fields
 * This is a utility function, not a Server Action
 */
export function generatePaperId(
	subject: string,
	paper: string,
	year: number,
	month: string
): string {
	const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
	const monthSlug = month.toLowerCase().replace(/\s+/g, '-');
	return `${subjectSlug}-${paper.toLowerCase()}-${year}-${monthSlug}`;
}
