import {describe, expect, test} from 'vite-plus/test';
import {Board} from '../../src/types.js';
import {championDefinition} from '../../src/pieces/definitions/champion.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

describe('champion movement', () => {
	test('has 16 moves from center (king + dabbaba + alfil)', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(16);
	});

	test('includes king-style adjacent moves', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 3, col: 3});
		expect(moves).toContainEqual({row: 3, col: 4});
		expect(moves).toContainEqual({row: 4, col: 5});
	});

	test('includes dabbaba jumps', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 2, col: 4});
		expect(moves).toContainEqual({row: 6, col: 4});
		expect(moves).toContainEqual({row: 4, col: 2});
		expect(moves).toContainEqual({row: 4, col: 6});
	});

	test('includes alfil jumps', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 2, col: 2});
		expect(moves).toContainEqual({row: 6, col: 6});
	});
});
