import {describe, expect, test} from 'vite-plus/test';
import {Board} from '../../src/types.js';
import {mannDefinition} from '../../src/pieces/definitions/mann.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

describe('mann movement', () => {
	test('has 8 moves from center like king', () => {
		const board = emptyBoard(8);
		const moves = mannDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(8);
	});

	test('has 3 moves from corner', () => {
		const board = emptyBoard(8);
		const moves = mannDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(3);
	});

	test('is not royal', () => {
		expect(mannDefinition.royal).toBe(false);
	});
});
