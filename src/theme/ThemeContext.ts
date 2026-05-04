import {createContext} from 'react';
import type {ThemeMode, ResolvedTheme} from './themeStorage.js';

export interface ThemeContextValue {
	readonly mode: ThemeMode;
	readonly resolvedTheme: ResolvedTheme;
	readonly setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
