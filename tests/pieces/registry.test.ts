import {describe, expect, test} from 'vite-plus/test';
import type {PieceDefinition} from '../../src/pieces/PieceDefinition.js';
import {
	getAllPieceDefinitions,
	getExtraPieceTypes,
	getPieceDefinition,
	getToggleablePieceTypes,
	registerPiece,
} from '../../src/pieces/registry.js';

describe('piece registry', () => {
	test('getPieceDefinition returns definition for standard pieces', () => {
		for (const type of ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']) {
			const def = getPieceDefinition(type);
			expect(def).toBeDefined();
			expect(def!.isStandard).toBe(true);
		}
	});

	test('getPieceDefinition returns undefined for unknown piece', () => {
		expect(getPieceDefinition('nonexistent')).toBeUndefined();
	});

	test('getExtraPieceTypes returns only non-standard pieces', () => {
		const extras = getExtraPieceTypes();
		expect(extras.length).toBeGreaterThan(0);
		for (const type of extras) {
			const def = getPieceDefinition(type);
			expect(def!.isStandard).toBe(false);
		}
		expect(extras).not.toContain('king');
		expect(extras).not.toContain('pawn');
	});

	test('getToggleablePieceTypes returns only toggleable pieces', () => {
		const toggleable = getToggleablePieceTypes();
		for (const type of toggleable) {
			const def = getPieceDefinition(type);
			expect(def!.toggleable).toBe(true);
		}
		expect(toggleable).not.toContain('king');
		expect(toggleable).not.toContain('pawn');
		expect(toggleable).toContain('queen');
		expect(toggleable).toContain('archbishop');
	});

	test('getAllPieceDefinitions returns all registered pieces', () => {
		const all = getAllPieceDefinitions();
		expect(all.size).toBeGreaterThanOrEqual(16);
		expect(all.has('king')).toBe(true);
		expect(all.has('archbishop')).toBe(true);
		expect(all.has('amazon')).toBe(true);
	});

	test('registerPiece adds a new piece', () => {
		const testDef: PieceDefinition = {
			name: 'TestPiece',
			notation: 'TP',
			symbols: {white: 'T', black: 't'},
			isStandard: false,
			count: 2,
			royal: false,
			jumper: false,
			toggleable: true,
			getValidMoves() {
				return [];
			},
		};
		registerPiece('testpiece', testDef);
		expect(getPieceDefinition('testpiece')).toBe(testDef);
	});
});
