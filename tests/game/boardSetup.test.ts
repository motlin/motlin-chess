import {describe, expect, test} from 'vite-plus/test';
import {buildBackRank, createInitialBoard, getStandardOffset} from '../../src/game/boardSetup.js';

describe('getStandardOffset', () => {
	test('offset is 0 for 8x8 board', () => {
		expect(getStandardOffset(8)).toBe(0);
	});

	test('offset is 1 for 10x10 board', () => {
		expect(getStandardOffset(10)).toBe(1);
	});

	test('offset is 2 for 12x12 board', () => {
		expect(getStandardOffset(12)).toBe(2);
	});
});

describe('createInitialBoard', () => {
	test('8x8 board has correct dimensions', () => {
		const board = createInitialBoard(8, new Set());
		expect(board.length).toBe(8);
		for (const row of board) {
			expect(row.length).toBe(8);
		}
	});

	test('8x8 board has correct back rank pieces', () => {
		const board = createInitialBoard(8, new Set());

		expect(board[0]![0]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![1]).toStrictEqual({type: 'knight', color: 'black', hasMoved: false});
		expect(board[0]![2]).toStrictEqual({type: 'bishop', color: 'black', hasMoved: false});
		expect(board[0]![3]).toStrictEqual({type: 'queen', color: 'black', hasMoved: false});
		expect(board[0]![4]).toStrictEqual({type: 'king', color: 'black', hasMoved: false});
		expect(board[0]![5]).toStrictEqual({type: 'bishop', color: 'black', hasMoved: false});
		expect(board[0]![6]).toStrictEqual({type: 'knight', color: 'black', hasMoved: false});
		expect(board[0]![7]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});

		expect(board[7]![0]).toStrictEqual({type: 'rook', color: 'white', hasMoved: false});
		expect(board[7]![4]).toStrictEqual({type: 'king', color: 'white', hasMoved: false});
	});

	test('8x8 board has pawns on rows 1 and 6', () => {
		const board = createInitialBoard(8, new Set());
		for (let col = 0; col < 8; col++) {
			expect(board[1]![col]).toStrictEqual({type: 'pawn', color: 'black', hasMoved: false});
			expect(board[6]![col]).toStrictEqual({type: 'pawn', color: 'white', hasMoved: false});
		}
	});

	test('8x8 board has empty middle rows', () => {
		const board = createInitialBoard(8, new Set());
		for (let row = 2; row <= 5; row++) {
			for (let col = 0; col < 8; col++) {
				expect(board[row]![col]).toBeNull();
			}
		}
	});

	test('10x10 board centers standard pieces', () => {
		const board = createInitialBoard(10, new Set());
		expect(board.length).toBe(10);

		expect(board[0]![0]).toBeNull();
		expect(board[0]![1]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![5]).toStrictEqual({type: 'king', color: 'black', hasMoved: false});
		expect(board[0]![8]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![9]).toBeNull();

		for (let col = 0; col < 10; col++) {
			expect(board[1]![col]).toStrictEqual({type: 'pawn', color: 'black', hasMoved: false});
			expect(board[8]![col]).toStrictEqual({type: 'pawn', color: 'white', hasMoved: false});
		}
	});

	test('12x12 board has correct layout', () => {
		const board = createInitialBoard(12, new Set());
		expect(board.length).toBe(12);

		expect(board[0]![0]).toBeNull();
		expect(board[0]![1]).toBeNull();
		expect(board[0]![2]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![6]).toStrictEqual({type: 'king', color: 'black', hasMoved: false});
		expect(board[0]![9]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![10]).toBeNull();
		expect(board[0]![11]).toBeNull();
	});

	test('4x4 board has king and truncated pieces', () => {
		const board = createInitialBoard(4, new Set());
		expect(board.length).toBe(4);
		for (const row of board) {
			expect(row.length).toBe(4);
		}

		const backRankTypes = [0, 1, 2, 3].map((col) => board[0]![col]?.type);
		expect(backRankTypes).toContain('king');

		for (let col = 0; col < 4; col++) {
			expect(board[1]![col]?.type).toBe('pawn');
			expect(board[2]![col]?.type).toBe('pawn');
		}
	});

	test('5x5 board has king and up to 5 back rank pieces', () => {
		const board = createInitialBoard(5, new Set());
		expect(board.length).toBe(5);

		const blackBackRank = [0, 1, 2, 3, 4].map((col) => board[0]![col]);
		const pieceTypes = blackBackRank.filter((p): p is NonNullable<typeof p> => p != null).map((p) => p.type);
		expect(pieceTypes).toContain('king');
		expect(pieceTypes.length).toBe(5);
	});
});

describe('buildBackRank', () => {
	test('standard 8-piece back rank', () => {
		const rank = buildBackRank(8, new Set());
		expect(rank).toStrictEqual(['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']);
	});

	test('archbishop adds two pieces symmetrically', () => {
		const rank = buildBackRank(10, new Set(['archbishop']));
		expect(rank).toStrictEqual([
			'rook',
			'knight',
			'archbishop',
			'bishop',
			'queen',
			'king',
			'bishop',
			'archbishop',
			'knight',
			'rook',
		]);
	});

	test('chancellor adds two pieces symmetrically', () => {
		const rank = buildBackRank(10, new Set(['chancellor']));
		expect(rank).toStrictEqual([
			'rook',
			'chancellor',
			'knight',
			'bishop',
			'queen',
			'king',
			'bishop',
			'knight',
			'chancellor',
			'rook',
		]);
	});

	test('all extra pieces on 12x12', () => {
		const rank = buildBackRank(12, new Set(['archbishop', 'chancellor', 'centaur']));
		expect(rank).toStrictEqual([
			'rook',
			'chancellor',
			'knight',
			'archbishop',
			'bishop',
			'queen',
			'centaur',
			'bishop',
			'archbishop',
			'knight',
			'chancellor',
			'rook',
		]);
	});

	test('centaur replaces king', () => {
		const rank = buildBackRank(8, new Set(['centaur']));
		expect(rank).toStrictEqual(['rook', 'knight', 'bishop', 'queen', 'centaur', 'bishop', 'knight', 'rook']);
	});

	test('extra pieces truncated when board too small', () => {
		const rank = buildBackRank(8, new Set(['archbishop', 'chancellor']));
		expect(rank.length).toBe(8);
		expect(rank).toContain('king');
	});
});
