import {describe, expect, test} from 'vite-plus/test';
import type {Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {pawnDefinition} from '../../src/pieces/definitions/pawn.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

const whitePawn: Piece = {type: 'pawn', color: 'white', hasMoved: false};
const blackPawn: Piece = {type: 'pawn', color: 'black', hasMoved: false};

describe('pawn movement', () => {
	test('white pawn moves forward one from non-starting position', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 4, 3, whitePawn);
		const moves = pawnDefinition.getValidMoves({row: 4, col: 3}, board, 'white', 8, null);
		expect(moves).toStrictEqual([{row: 3, col: 3}]);
	});

	test('white pawn moves forward one or two from starting position', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 6, 3, whitePawn);
		const moves = pawnDefinition.getValidMoves({row: 6, col: 3}, board, 'white', 8, null);
		expect(moves).toStrictEqual([
			{row: 5, col: 3},
			{row: 4, col: 3},
		]);
	});

	test('black pawn moves forward from starting position', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 1, 3, blackPawn);
		const moves = pawnDefinition.getValidMoves({row: 1, col: 3}, board, 'black', 8, null);
		expect(moves).toStrictEqual([
			{row: 2, col: 3},
			{row: 3, col: 3},
		]);
	});

	test('pawn blocked by piece ahead', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 6, 3, whitePawn);
		board = placePiece(board, 5, 3, blackPawn);
		const moves = pawnDefinition.getValidMoves({row: 6, col: 3}, board, 'white', 8, null);
		expect(moves).toStrictEqual([]);
	});

	test('pawn double-step blocked by piece two ahead', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 6, 3, whitePawn);
		board = placePiece(board, 4, 3, blackPawn);
		const moves = pawnDefinition.getValidMoves({row: 6, col: 3}, board, 'white', 8, null);
		expect(moves).toStrictEqual([{row: 5, col: 3}]);
	});

	test('pawn captures diagonally', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 4, 3, whitePawn);
		board = placePiece(board, 3, 2, blackPawn);
		board = placePiece(board, 3, 4, blackPawn);
		const moves = pawnDefinition.getValidMoves({row: 4, col: 3}, board, 'white', 8, null);
		expect(moves).toStrictEqual([
			{row: 3, col: 3},
			{row: 3, col: 2},
			{row: 3, col: 4},
		]);
	});

	test('pawn does not capture same color', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 4, 3, whitePawn);
		board = placePiece(board, 3, 2, {...whitePawn});
		const moves = pawnDefinition.getValidMoves({row: 4, col: 3}, board, 'white', 8, null);
		expect(moves).toStrictEqual([{row: 3, col: 3}]);
	});

	test('en passant capture', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, whitePawn);
		board = placePiece(board, 3, 4, blackPawn);
		const moves = pawnDefinition.getValidMoves({row: 3, col: 3}, board, 'white', 8, {row: 2, col: 4});
		const enPassantMove = moves.find((m) => m.row === 2 && m.col === 4);
		expect(enPassantMove).toBeDefined();
	});

	test('pawn starting row on 10x10 board', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 8, 3, whitePawn);
		const moves = pawnDefinition.getValidMoves({row: 8, col: 3}, board, 'white', 10, null);
		expect(moves).toStrictEqual([
			{row: 7, col: 3},
			{row: 6, col: 3},
		]);
	});
});
