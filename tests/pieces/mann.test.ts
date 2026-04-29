import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {mannDefinition} from '../../src/pieces/definitions/mann.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('mann movement', () => {
	test('has 8 moves from center like king', () => {
		const board = emptyBoard(8);
		const moves = mannDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(8);
	});

	test('has 3 moves from corner', () => {
		const board = emptyBoard(8);
		const moves = mannDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(3);
	});

	test('is not royal', () => {
		expect(mannDefinition.royal).toBe(false);
	});

	test('can capture enemy piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = mannDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 3, col: 4});
	});

	test('cannot land on friendly piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = mannDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.find((m) => m.row === 3 && m.col === 4)).toBeUndefined();
		expect(moves.length).toBe(7);
	});

	test('works on 10x10 board', () => {
		const board = emptyBoard(10);
		const moves = mannDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.length).toBe(8);
	});
});
