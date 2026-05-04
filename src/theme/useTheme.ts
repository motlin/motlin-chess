import {useContext} from 'react';
import {ThemeContext} from './ThemeContext.js';
import type {ThemeContextValue} from './ThemeContext.js';

export function useTheme(): ThemeContextValue {
	const value = useContext(ThemeContext);
	if (value === null) throw new Error('useTheme must be used within ThemeProvider');
	return value;
}
