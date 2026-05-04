import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {ThemeContext} from './ThemeContext.js';
import type {ThemeMode} from './themeStorage.js';
import {readStoredMode, resolveTheme, writeStoredMode} from './themeStorage.js';

interface ThemeProviderProps {
	readonly children: ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
	const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
	const [prefersDark, setPrefersDark] = useState<boolean>(
		() => window.matchMedia('(prefers-color-scheme: dark)').matches,
	);

	useEffect(() => {
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (event: MediaQueryListEvent) => {
			setPrefersDark(event.matches);
		};
		mql.addEventListener('change', handler);
		return () => {
			mql.removeEventListener('change', handler);
		};
	}, []);

	const resolvedTheme = resolveTheme(mode, prefersDark);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', resolvedTheme);
	}, [resolvedTheme]);

	const setMode = useCallback((newMode: ThemeMode) => {
		setModeState(newMode);
		writeStoredMode(newMode);
	}, []);

	const value = useMemo(() => ({mode, resolvedTheme, setMode}), [mode, resolvedTheme, setMode]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
