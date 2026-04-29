import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {amazonDefinition} from '../../src/pieces/definitions/amazon.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
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

	test('can capture enemy piece on queen sliding line', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 4, 7, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = amazonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 4, col: 7});
	});

	test('blocked by friendly piece on sliding line', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 4, 5, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = amazonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.find((m) => m.row === 4 && m.col === 5)).toBeUndefined();
		expect(moves.find((m) => m.row === 4 && m.col === 6)).toBeUndefined();
	});

	test('works on 12x12 board', () => {
		const board = emptyBoard(12);
		const moves = amazonDefinition.getValidMoves({row: 6, col: 6}, board, 'white', 12, null);
		const knightMoves = moves.filter(
			(m) =>
				(Math.abs(m.row - 6) === 2 && Math.abs(m.col - 6) === 1) ||
				(Math.abs(m.row - 6) === 1 && Math.abs(m.col - 6) === 2),
		);
		expect(knightMoves.length).toBe(8);

		const cardinalMoves = moves.filter((m) => m.row === 6 || m.col === 6);
		expect(cardinalMoves.length).toBeGreaterThan(0);

		expect(moves.length).toBeGreaterThan(35);
	});
});
