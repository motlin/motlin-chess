import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {queenDefinition} from '../../src/pieces/definitions/queen.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('queen movement', () => {
	test('slides in all 8 directions from center of empty 8x8', () => {
		const board = emptyBoard(8);
		const moves = queenDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(27);
	});

	test('blocked by friendly piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = queenDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 4)).toBe(false);
		expect(moves.some((m) => m.row === 1 && m.col === 4)).toBe(false);
		expect(moves.some((m) => m.row === 0 && m.col === 4)).toBe(false);
	});

	test('can capture enemy piece then stops', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = queenDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 4)).toBe(true);
		expect(moves.some((m) => m.row === 1 && m.col === 4)).toBe(false);
	});

	test('works on 12x12 board', () => {
		const board = emptyBoard(12);
		const moves = queenDefinition.getValidMoves({row: 6, col: 6}, board, 'white', 12, null);
		expect(moves.length).toBeGreaterThan(27);
	});
});
