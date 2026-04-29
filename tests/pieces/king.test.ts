import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {kingDefinition} from '../../src/pieces/definitions/king.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

describe('king movement', () => {
	test('has 8 moves from center', () => {
		const board = emptyBoard(8);
		const moves = kingDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.length).toBe(8);
	});

	test('has 3 moves from corner', () => {
		const board = emptyBoard(8);
		const moves = kingDefinition.getValidMoves({row: 0, col: 0}, board, 'white', 8, null);
		expect(moves.length).toBe(3);
	});

	test('cannot move onto friendly piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = kingDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 3 && m.col === 4)).toBe(false);
		expect(moves.length).toBe(7);
	});

	test('can capture enemy piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, {type: 'pawn', color: 'black', hasMoved: false});
		const moves = kingDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		expect(moves.some((m) => m.row === 3 && m.col === 4)).toBe(true);
		expect(moves.length).toBe(8);
	});

	test('metadata: royal is true, jumper is false, count is 1', () => {
		expect(kingDefinition.royal).toBe(true);
		expect(kingDefinition.jumper).toBe(false);
		expect(kingDefinition.count).toBe(1);
	});
});
