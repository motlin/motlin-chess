import {describe, expect, test} from 'vite-plus/test';
import type {Board, Piece} from '../../src/types.js';
import {archbishopDefinition} from '../../src/pieces/definitions/archbishop.js';

function emptyBoard(size: number): Board {
	return Array.from({length: size}, () => Array.from<Piece | null>({length: size}).fill(null));
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	const newBoard = board.map((r) => [...r]);
	newBoard[row]![col] = piece;
	return newBoard;
}

describe('archbishop movement', () => {
	test('combines bishop and knight moves from center', () => {
		const board = emptyBoard(8);
		const moves = archbishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		const knightMoves = moves.filter(
			(m) =>
				(Math.abs(m.row - 4) === 2 && Math.abs(m.col - 4) === 1) ||
				(Math.abs(m.row - 4) === 1 && Math.abs(m.col - 4) === 2),
		);
		expect(knightMoves.length).toBe(8);

		const diagonalMoves = moves.filter((m) => Math.abs(m.row - 4) === Math.abs(m.col - 4));
		expect(diagonalMoves.length).toBeGreaterThan(0);

		expect(moves.length).toBeGreaterThan(8);
	});

	test('does not include cardinal direction moves', () => {
		const board = emptyBoard(8);
		const moves = archbishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		const cardinalMoves = moves.filter((m) => (m.row === 4 && m.col !== 4) || (m.col === 4 && m.row !== 4));
		expect(cardinalMoves.length).toBe(0);
	});

	test('blocked by friendly piece on diagonal but knight can jump', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, {type: 'pawn', color: 'white', hasMoved: false});
		const moves = archbishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		const blockedDiagonal = moves.find((m) => m.row === 2 && m.col === 2);
		expect(blockedDiagonal).toBeUndefined();

		const knightJump = moves.find((m) => m.row === 2 && m.col === 3);
		expect(knightJump).toBeDefined();
	});

	test('no duplicate squares in combined moves', () => {
		const board = emptyBoard(8);
		const moves = archbishopDefinition.getValidMoves({row: 4, col: 4}, board, 'white', 8, null);
		const keys = moves.map((m) => `${m.row},${m.col}`);
		const uniqueKeys = new Set(keys);
		expect(uniqueKeys.size).toBe(keys.length);
	});
});
