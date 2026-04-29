import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {zebraDefinition} from '../../src/pieces/definitions/zebra.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('zebra movement', () => {
	test('has 8 moves from center of large board', () => {
		const board = emptyBoard(10);
		const moves = zebraDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.length).toBe(8);
	});

	test('has fewer moves near edges', () => {
		const board = emptyBoard(8);
		const moves = zebraDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(2);
		expect(moves).toContainEqual({row: 3, col: 2});
		expect(moves).toContainEqual({row: 2, col: 3});
	});

	test('moves are (3,2) leaps', () => {
		const board = emptyBoard(10);
		const moves = zebraDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		for (const m of moves) {
			const dr = Math.abs(m.row - 5);
			const dc = Math.abs(m.col - 5);
			expect([dr, dc].sort().join(',')).toBe('2,3');
		}
	});

	test('can capture enemy piece', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 2, 3, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = zebraDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves).toContainEqual({row: 2, col: 3});
	});

	test('cannot land on friendly piece', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 2, 3, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = zebraDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.find((m) => m.row === 2 && m.col === 3)).toBeUndefined();
		expect(moves.length).toBe(7);
	});
});
