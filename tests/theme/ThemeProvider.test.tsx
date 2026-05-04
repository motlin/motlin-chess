// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, test} from 'vite-plus/test';
import {act, renderHook} from '@testing-library/react';
import type {ReactNode} from 'react';
import {ThemeProvider} from '../../src/theme/ThemeProvider.js';
import {useTheme} from '../../src/theme/useTheme.js';
import {THEME_STORAGE_KEY} from '../../src/theme/themeStorage.js';

type MediaQueryListener = (event: MediaQueryListEvent) => void;

let listeners: MediaQueryListener[];
let darkMatches: boolean;

function createMockMatchMedia(matches: boolean) {
	darkMatches = matches;
	return (query: string): MediaQueryList => ({
		matches: query === '(prefers-color-scheme: dark)' ? darkMatches : false,
		media: query,
		onchange: null,
		addEventListener(_event: string, listener: EventListenerOrEventListenerObject | null) {
			if (typeof listener === 'function') {
				listeners.push(listener as unknown as MediaQueryListener);
			}
		},
		removeEventListener(_event: string, listener: EventListenerOrEventListenerObject | null) {
			if (typeof listener === 'function') {
				listeners = listeners.filter((l) => l !== (listener as unknown as MediaQueryListener));
			}
		},
		addListener() {},
		removeListener() {},
		dispatchEvent: () => true,
	});
}

function wrapper({children}: {readonly children: ReactNode}) {
	return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeProvider', () => {
	beforeEach(() => {
		listeners = [];
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
		window.matchMedia = createMockMatchMedia(true) as typeof window.matchMedia;
	});

	afterEach(() => {
		listeners = [];
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
	});

	test('sets data-theme on document.documentElement on mount', () => {
		renderHook(() => useTheme(), {wrapper});

		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});

	test('default mode is system and applies based on matchMedia preferring dark', () => {
		window.matchMedia = createMockMatchMedia(true) as typeof window.matchMedia;

		const {result} = renderHook(() => useTheme(), {wrapper});

		expect(result.current.mode).toBe('system');
		expect(result.current.resolvedTheme).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});

	test('default mode is system and applies based on matchMedia preferring light', () => {
		window.matchMedia = createMockMatchMedia(false) as typeof window.matchMedia;

		const {result} = renderHook(() => useTheme(), {wrapper});

		expect(result.current.mode).toBe('system');
		expect(result.current.resolvedTheme).toBe('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
	});

	test('setMode light updates documentElement and writes to localStorage', () => {
		const {result} = renderHook(() => useTheme(), {wrapper});

		act(() => {
			result.current.setMode('light');
		});

		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
		expect(result.current.mode).toBe('light');
		expect(result.current.resolvedTheme).toBe('light');
	});

	test('setMode dark updates documentElement and writes to localStorage', () => {
		const {result} = renderHook(() => useTheme(), {wrapper});

		act(() => {
			result.current.setMode('dark');
		});

		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
		expect(result.current.mode).toBe('dark');
		expect(result.current.resolvedTheme).toBe('dark');
	});

	test('matchMedia change event when mode is system updates resolvedTheme', () => {
		window.matchMedia = createMockMatchMedia(false) as typeof window.matchMedia;
		const {result} = renderHook(() => useTheme(), {wrapper});

		expect(result.current.resolvedTheme).toBe('light');

		act(() => {
			for (const listener of listeners) {
				listener({matches: true} as MediaQueryListEvent);
			}
		});

		expect(result.current.resolvedTheme).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});

	test('when mode is light, matchMedia changes do NOT change resolvedTheme', () => {
		window.matchMedia = createMockMatchMedia(false) as typeof window.matchMedia;
		const {result} = renderHook(() => useTheme(), {wrapper});

		act(() => {
			result.current.setMode('light');
		});

		expect(result.current.resolvedTheme).toBe('light');

		act(() => {
			for (const listener of listeners) {
				listener({matches: true} as MediaQueryListEvent);
			}
		});

		expect(result.current.resolvedTheme).toBe('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
	});

	test('useTheme throws when used outside provider', () => {
		expect(() => {
			renderHook(() => useTheme());
		}).toThrow('useTheme must be used within ThemeProvider');
	});
});
