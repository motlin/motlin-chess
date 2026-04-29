import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {dragonDefinition} from '../../src/pieces/definitions/dragon.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('dragon movement', () => {
	test('has knight moves from center on empty board', () => {
		const board = emptyBoard(8);
		const moves = dragonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(8);
	});

	test('white dragon can capture diagonally forward', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, {type: 'pawn', color: 'black', hasMoved: false});
		board = placePiece(board, 3, 5, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = dragonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves).toContainEqual({row: 3, col: 3});
		expect(moves).toContainEqual({row: 3, col: 5});
	});

	test('cannot capture diagonally backward', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 5, 3, {type: 'pawn', color: 'black', hasMoved: false});
		board = placePiece(board, 5, 5, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = dragonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.find((m) => m.row === 5 && m.col === 3)).toBeUndefined();
		expect(moves.find((m) => m.row === 5 && m.col === 5)).toBeUndefined();
	});

	test('diagonal captures only on enemy pieces', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = dragonDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.find((m) => m.row === 3 && m.col === 3)).toBeUndefined();
	});
});
