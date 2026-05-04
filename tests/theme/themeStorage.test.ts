// @vitest-environment jsdom

import {afterEach, describe, expect, test} from 'vite-plus/test';
import {readStoredMode, resolveTheme, THEME_STORAGE_KEY} from '../../src/theme/themeStorage.js';

describe('readStoredMode', () => {
	afterEach(() => {
		localStorage.clear();
	});

	test('returns system when key is absent', () => {
		expect(readStoredMode()).toBe('system');
	});

	test('returns light when light is stored', () => {
		localStorage.setItem(THEME_STORAGE_KEY, 'light');
		expect(readStoredMode()).toBe('light');
	});

	test('returns dark when dark is stored', () => {
		localStorage.setItem(THEME_STORAGE_KEY, 'dark');
		expect(readStoredMode()).toBe('dark');
	});

	test('returns system when system is stored', () => {
		localStorage.setItem(THEME_STORAGE_KEY, 'system');
		expect(readStoredMode()).toBe('system');
	});

	test('returns system for invalid stored value', () => {
		localStorage.setItem(THEME_STORAGE_KEY, 'garbage');
		expect(readStoredMode()).toBe('system');
	});

	test('returns system for empty string stored value', () => {
		localStorage.setItem(THEME_STORAGE_KEY, '');
		expect(readStoredMode()).toBe('system');
	});
});

describe('resolveTheme', () => {
	test('system mode with prefersDark true resolves to dark', () => {
		expect(resolveTheme('system', true)).toBe('dark');
	});

	test('system mode with prefersDark false resolves to light', () => {
		expect(resolveTheme('system', false)).toBe('light');
	});

	test('light mode with prefersDark true resolves to light', () => {
		expect(resolveTheme('light', true)).toBe('light');
	});

	test('light mode with prefersDark false resolves to light', () => {
		expect(resolveTheme('light', false)).toBe('light');
	});

	test('dark mode with prefersDark true resolves to dark', () => {
		expect(resolveTheme('dark', true)).toBe('dark');
	});

	test('dark mode with prefersDark false resolves to dark', () => {
		expect(resolveTheme('dark', false)).toBe('dark');
	});
});
