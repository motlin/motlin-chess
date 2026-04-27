import {describe, expect, test} from 'vite-plus/test';
import type {Board, Piece} from '../../src/types.js';
import {getSlidingMoves, getStepMoves, isInBounds, CARDINAL_DIRECTIONS} from '../../src/pieces/moveHelpers.js';

function emptyBoard(size: number): Board {
	return Array.from({length: size}, () => Array.from<Piece | null>({length: size}).fill(null));
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	const newBoard = board.map((r) => [...r]);
	newBoard[row]![col] = piece;
	return newBoard;
}

const whitePawn: Piece = {type: 'pawn', color: 'white', hasMoved: false};
const blackPawn: Piece = {type: 'pawn', color: 'black', hasMoved: false};

describe('isInBounds', () => {
	test('returns true for valid positions on 8x8', () => {
		expect(isInBounds(0, 0, 8)).toBe(true);
		expect(isInBounds(7, 7, 8)).toBe(true);
		expect(isInBounds(3, 4, 8)).toBe(true);
	});

	test('returns false for out of bounds positions', () => {
		expect(isInBounds(-1, 0, 8)).toBe(false);
		expect(isInBounds(0, -1, 8)).toBe(false);
		expect(isInBounds(8, 0, 8)).toBe(false);
		expect(isInBounds(0, 8, 8)).toBe(false);
	});

	test('works with larger board sizes', () => {
		expect(isInBounds(9, 9, 10)).toBe(true);
		expect(isInBounds(10, 0, 10)).toBe(false);
	});
});

describe('getSlidingMoves', () => {
	test('slides in cardinal directions on empty board', () => {
		const board = emptyBoard(8);
		const boardWithRook = placePiece(board, 3, 3, {type: 'rook', color: 'white', hasMoved: false});
		const moves = getSlidingMoves({row: 3, col: 3}, boardWithRook, 'white', 8, CARDINAL_DIRECTIONS);
		expect(moves.length).toBe(14);
	});

	test('stops at same-color piece', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, {type: 'rook', color: 'white', hasMoved: false});
		board = placePiece(board, 3, 5, whitePawn);
		const moves = getSlidingMoves({row: 3, col: 3}, board, 'white', 8, CARDINAL_DIRECTIONS);
		const rightMoves = moves.filter((m) => m.row === 3 && m.col > 3);
		expect(rightMoves.length).toBe(1);
	});

	test('captures opposite-color piece and stops', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, {type: 'rook', color: 'white', hasMoved: false});
		board = placePiece(board, 3, 5, blackPawn);
		const moves = getSlidingMoves({row: 3, col: 3}, board, 'white', 8, CARDINAL_DIRECTIONS);
		const rightMoves = moves.filter((m) => m.row === 3 && m.col > 3);
		expect(rightMoves.length).toBe(2);
		expect(rightMoves.some((m) => m.col === 5)).toBe(true);
	});
});

describe('getStepMoves', () => {
	test('returns valid positions for offsets', () => {
		const board = emptyBoard(8);
		const offsets: readonly (readonly [number, number])[] = [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1],
		];
		const moves = getStepMoves({row: 4, col: 4}, board, 'white', 8, offsets);
		expect(moves.length).toBe(4);
	});

	test('skips out of bounds positions', () => {
		const board = emptyBoard(8);
		const offsets: readonly (readonly [number, number])[] = [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1],
		];
		const moves = getStepMoves({row: 0, col: 0}, board, 'white', 8, offsets);
		expect(moves.length).toBe(2);
	});

	test('skips same-color occupied squares', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, whitePawn);
		const offsets: readonly (readonly [number, number])[] = [[-1, 0]];
		const moves = getStepMoves({row: 4, col: 4}, board, 'white', 8, offsets);
		expect(moves.length).toBe(0);
	});

	test('includes opposite-color occupied squares', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 4, blackPawn);
		const offsets: readonly (readonly [number, number])[] = [[-1, 0]];
		const moves = getStepMoves({row: 4, col: 4}, board, 'white', 8, offsets);
		expect(moves.length).toBe(1);
	});
});
