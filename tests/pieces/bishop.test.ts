import {describe, expect, test} from 'vite-plus/test';
import type {Board, Piece} from '../../src/types.js';
import {bishopDefinition} from '../../src/pieces/definitions/bishop.js';

function emptyBoard(size: number): Board {
	return Array.from({length: size}, () => Array.from<Piece | null>({length: size}).fill(null));
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	const newBoard = board.map((r) => [...r]);
	newBoard[row]![col] = piece;
	return newBoard;
}

describe('bishop movement', () => {
	test('has 13 moves from center of empty 8x8', () => {
		const board = emptyBoard(8);
		const moves = bishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(13);
	});

	test('blocked by friendly piece on diagonal', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 2, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = bishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 2)).toBe(false);
		expect(moves.some((m) => m.row === 1 && m.col === 1)).toBe(false);
	});

	test('can capture enemy piece on diagonal', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 2, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = bishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 2 && m.col === 2)).toBe(true);
		expect(moves.some((m) => m.row === 1 && m.col === 1)).toBe(false);
	});

	test('corner has 7 moves', () => {
		const board = emptyBoard(8);
		const moves = bishopDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(7);
	});

	test('works on 10x10 board', () => {
		const board = emptyBoard(10);
		const moves = bishopDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.length).toBeGreaterThan(13);
	});
});
