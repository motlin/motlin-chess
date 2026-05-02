import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {camelDefinition} from '../../src/pieces/definitions/camel.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('camel movement', () => {
	test('has 8 moves from center of empty board', () => {
		const board = emptyBoard(8);
		const moves = camelDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(8);
	});

	test('all moves are (3,1) leaps', () => {
		const board = emptyBoard(8);
		const moves = camelDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		for (const move of moves) {
			const dr = Math.abs(move.row - 4);
			const dc = Math.abs(move.col - 4);
			expect(dr + dc).toBe(4);
			expect(Math.min(dr, dc)).toBe(1);
			expect(Math.max(dr, dc)).toBe(3);
		}
	});

	test('has 2 moves from corner on 8x8', () => {
		const board = emptyBoard(8);
		const moves = camelDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(2);
	});

	test('can capture enemy pieces', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 1, 3, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = camelDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 1 && m.col === 3)).toBe(true);
	});

	test('cannot land on friendly pieces', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 1, 3, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = camelDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 1 && m.col === 3)).toBe(false);
		expect(moves.length).toBe(7);
	});

	test('works on larger boards', () => {
		const board = emptyBoard(12);
		const moves = camelDefinition.getValidMoves({row: 6, col: 6}, board, 'white', 12, null);
		expect(moves.length).toBe(8);
	});

	test('limited moves on edge of board', () => {
		const board = emptyBoard(8);
		const moves = camelDefinition.getValidMoves({row: 0, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(4);
	});
});
