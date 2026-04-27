import {describe, expect, test} from 'vite-plus/test';
import type {Board, Piece} from '../../src/types.js';
import {knightDefinition} from '../../src/pieces/definitions/knight.js';

function emptyBoard(size: number): Board {
	return Array.from({length: size}, () => Array.from<Piece | null>({length: size}).fill(null));
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	const newBoard = board.map((r) => [...r]);
	newBoard[row]![col] = piece;
	return newBoard;
}

describe('knight movement', () => {
	test('has 8 moves from center of empty board', () => {
		const board = emptyBoard(8);
		const moves = knightDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(8);
	});

	test('has 2 moves from corner', () => {
		const board = emptyBoard(8);
		const moves = knightDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(2);
	});

	test('can capture enemy pieces', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 3, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = knightDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 3)).toBe(true);
	});

	test('cannot land on friendly pieces', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 3, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = knightDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 3)).toBe(false);
		expect(moves.length).toBe(7);
	});

	test('works on larger boards', () => {
		const board = emptyBoard(12);
		const moves = knightDefinition.getValidMoves({row: 6, col: 6}, board, 'white', 12, null);
		expect(moves.length).toBe(8);
	});
});
