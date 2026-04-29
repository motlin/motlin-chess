import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {rookDefinition} from '../../src/pieces/definitions/rook.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('rook movement', () => {
	test('has 14 moves from center of empty 8x8', () => {
		const board = emptyBoard(8);
		const moves = rookDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(14);
	});

	test('blocked by friendly piece on file', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = rookDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 4)).toBe(false);
		expect(moves.some((m) => m.row === 1 && m.col === 4)).toBe(false);
	});

	test('can capture enemy piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = rookDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 4)).toBe(true);
		expect(moves.some((m) => m.row === 1 && m.col === 4)).toBe(false);
	});

	test('corner has 14 moves on empty board', () => {
		const board = emptyBoard(8);
		const moves = rookDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(14);
	});

	test('works on 10x10 board', () => {
		const board = emptyBoard(10);
		const moves = rookDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.length).toBe(18);
	});
});
