import {describe, expect, test} from 'vite-plus/test';
import {Board} from '../../src/types.js';
import {wizardDefinition} from '../../src/pieces/definitions/wizard.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

describe('wizard movement', () => {
	test('has 12 moves from center of large board (4 ferz + 8 camel)', () => {
		const board = emptyBoard(10);
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.length).toBe(12);
	});

	test('includes ferz diagonal steps', () => {
		const board = emptyBoard(10);
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves).toContainEqual({row: 4, col: 4});
		expect(moves).toContainEqual({row: 4, col: 6});
		expect(moves).toContainEqual({row: 6, col: 4});
		expect(moves).toContainEqual({row: 6, col: 6});
	});

	test('includes camel leaps', () => {
		const board = emptyBoard(10);
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves).toContainEqual({row: 2, col: 4});
		expect(moves).toContainEqual({row: 2, col: 6});
		expect(moves).toContainEqual({row: 8, col: 4});
		expect(moves).toContainEqual({row: 8, col: 6});
	});
});
