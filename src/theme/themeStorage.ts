export const THEME_STORAGE_KEY = 'motlin-chess-theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function readStoredMode(): ThemeMode {
	try {
		const v = localStorage.getItem(THEME_STORAGE_KEY);
		return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
	} catch {
		return 'system';
	}
}

export function writeStoredMode(mode: ThemeMode): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, mode);
	} catch {
		/* private mode / disabled storage */
	}
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
	if (mode === 'system') return prefersDark ? 'dark' : 'light';
	return mode;
}
