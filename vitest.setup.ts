// Vitest setup file for unit tests.
//
// vite-plus-test's jsdom environment does not copy window.localStorage or
// window.sessionStorage onto the global scope (they are non-enumerable
// accessors on Window.prototype, not own properties, and are absent from the
// environment's key allowlist). Bridge them from the jsdom window -- exposed as
// globalThis.jsdom -- so tests that opt into the jsdom environment can use the
// Storage globals. For node-environment tests globalThis.jsdom is undefined and
// this setup is a no-op.
const dom = (globalThis as {jsdom?: {window: Window & typeof globalThis}}).jsdom;
if (dom?.window) {
	if (typeof globalThis.localStorage === 'undefined') {
		globalThis.localStorage = dom.window.localStorage;
	}

	if (typeof globalThis.sessionStorage === 'undefined') {
		globalThis.sessionStorage = dom.window.sessionStorage;
	}
}
