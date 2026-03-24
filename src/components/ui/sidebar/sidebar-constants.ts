export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_MOBILE = '80vw';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export function setCookie(name: string, value: string, maxAge: number) {
	if (typeof window !== 'undefined' && 'cookieStore' in window) {
		(
			window as Window & {
				cookieStore: {
					set: (options: { name: string; value: string; path: string; maxAge: number }) => void;
				};
			}
		).cookieStore.set({
			name,
			value,
			path: '/',
			maxAge,
		});
	} else {
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not available, fallback required
		document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
	}
}
