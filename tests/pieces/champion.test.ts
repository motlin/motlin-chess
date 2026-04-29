import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {championDefinition} from '../../src/pieces/definitions/champion.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('champion movement', () => {
	test('has 16 moves from center (king + dabbaba + alfil)', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(16);
	});

	test('includes king-style adjacent moves', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 3, col: 3});
		expect(moves).toContainEqual({row: 3, col: 4});
		expect(moves).toContainEqual({row: 4, col: 5});
	});

	test('includes dabbaba jumps', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 2, col: 4});
		expect(moves).toContainEqual({row: 6, col: 4});
		expect(moves).toContainEqual({row: 4, col: 2});
		expect(moves).toContainEqual({row: 4, col: 6});
	});

	test('includes alfil jumps', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 2, col: 2});
		expect(moves).toContainEqual({row: 6, col: 6});
	});

	test('cannot land on friendly piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, {type: 'pawn', color: 'white', hasMoved: false});
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.find((m) => m.row === 3 && m.col === 4)).toBeUndefined();
		expect(moves.find((m) => m.row === 2 && m.col === 4)).toBeUndefined();
	});

	test('can capture enemy on dabbaba square', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = championDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 2, col: 4});
	});

	test('has fewer moves from corner', () => {
		const board = emptyBoard(8);
		const moves = championDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBeLessThan(16);
		expect(moves).toContainEqual({row: 0, col: 1});
		expect(moves).toContainEqual({row: 1, col: 0});
		expect(moves).toContainEqual({row: 1, col: 1});
		expect(moves).toContainEqual({row: 0, col: 2});
		expect(moves).toContainEqual({row: 2, col: 0});
		expect(moves).toContainEqual({row: 2, col: 2});
	});
});
