import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {elephantDefinition} from '../../src/pieces/definitions/elephant.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('elephant movement', () => {
	test('has 4 moves from center of empty board', () => {
		const board = emptyBoard(8);
		const moves = elephantDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(4);
		expect(moves).toContainEqual({row: 2, col: 2});
		expect(moves).toContainEqual({row: 2, col: 6});
		expect(moves).toContainEqual({row: 6, col: 2});
		expect(moves).toContainEqual({row: 6, col: 6});
	});

	test('has 1 move from corner', () => {
		const board = emptyBoard(8);
		const moves = elephantDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(1);
		expect(moves[0]).toStrictEqual({row: 2, col: 2});
	});

	test('jumps over pieces', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = elephantDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 2, col: 2});
	});
});
