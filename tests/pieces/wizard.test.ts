import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {wizardDefinition} from '../../src/pieces/definitions/wizard.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('wizard movement', () => {
	test('has 12 moves from center of large board (4 ferz + 8 camel)', () => {
		const board = emptyBoard(10);
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.length).toBe(12);
	});

	test('includes ferz diagonal steps', () => {
		const board = emptyBoard(10);
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves).toContainEqual({row: 4, col: 4});
		expect(moves).toContainEqual({row: 4, col: 6});
		expect(moves).toContainEqual({row: 6, col: 4});
		expect(moves).toContainEqual({row: 6, col: 6});
	});

	test('includes camel leaps', () => {
		const board = emptyBoard(10);
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves).toContainEqual({row: 2, col: 4});
		expect(moves).toContainEqual({row: 2, col: 6});
		expect(moves).toContainEqual({row: 8, col: 4});
		expect(moves).toContainEqual({row: 8, col: 6});
	});

	test('can capture enemy piece on camel leap', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves).toContainEqual({row: 2, col: 4});
	});

	test('cannot land on friendly piece', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 2, 4, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = wizardDefinition.getValidMoves({row: 5, col: 5}, board, 'white', 10, null);
		expect(moves.find((m) => m.row === 2 && m.col === 4)).toBeUndefined();
		expect(moves.length).toBe(11);
	});

	test('has fewer moves from corner on 8x8', () => {
		const board = emptyBoard(8);
		const moves = wizardDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBeLessThan(12);
		expect(moves).toContainEqual({row: 1, col: 1});
		expect(moves).toContainEqual({row: 3, col: 1});
		expect(moves).toContainEqual({row: 1, col: 3});
	});
});
