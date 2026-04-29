import {describe, expect, test} from 'vite-plus/test';
import {Board} from '../../src/types.js';
import {amazonDefinition} from '../../src/pieces/definitions/amazon.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

describe('amazon movement', () => {
	test('combines queen and knight moves from center', () => {
		const board = emptyBoard(8);
		const moves = amazonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		const knightMoves = moves.filter(
			(m) =>
				(Math.abs(m.row - 4) === 2 && Math.abs(m.col - 4) === 1) ||
				(Math.abs(m.row - 4) === 1 && Math.abs(m.col - 4) === 2),
		);
		expect(knightMoves.length).toBe(8);

		const cardinalMoves = moves.filter((m) => m.row === 4 || m.col === 4);
		expect(cardinalMoves.length).toBeGreaterThan(0);

		const diagonalMoves = moves.filter(
			(m) => m.row !== 4 && m.col !== 4 && Math.abs(m.row - 4) === Math.abs(m.col - 4),
		);
		expect(diagonalMoves.length).toBeGreaterThan(0);
	});

	test('no duplicate squares', () => {
		const board = emptyBoard(8);
		const moves = amazonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		const keys = moves.map((m) => `${m.row},${m.col}`);
		expect(new Set(keys).size).toBe(keys.length);
	});
});
