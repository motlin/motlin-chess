import {describe, expect, test} from 'vite-plus/test';
import {buildBackRank, createInitialBoard, getStandardOffset} from '../../src/game/boardSetup.js';

const STD = new Set(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']);
function withPieces(...extras: string[]): ReadonlySet<string> {
	return new Set([...STD, ...extras]);
}

describe('getStandardOffset', () => {
	test('offset is 0 for 8x8 board', () => {
		expect(getStandardOffset(8)).toBe(0);
	});

	test('offset is 1 for 10x10 board', () => {
		expect(getStandardOffset(10)).toBe(1);
	});

	test('offset is 0 for boards smaller than 8', () => {
		expect(getStandardOffset(4)).toBe(0);
		expect(getStandardOffset(6)).toBe(0);
	});

	test('offset is 2 for 12x12 board', () => {
		expect(getStandardOffset(12)).toBe(2);
	});
});

describe('createInitialBoard', () => {
	test('8x8 board has correct dimensions', () => {
		const board = createInitialBoard(8, STD);
		expect(board.length).toBe(8);
		for (const row of board) {
			expect(row.length).toBe(8);
		}
	});

	test('8x8 board has correct back rank pieces', () => {
		const board = createInitialBoard(8, STD);

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
		const board = createInitialBoard(8, STD);
		for (let col = 0; col < 8; col++) {
			expect(board[1]![col]).toStrictEqual({type: 'pawn', color: 'black', hasMoved: false});
			expect(board[6]![col]).toStrictEqual({type: 'pawn', color: 'white', hasMoved: false});
		}
	});

	test('8x8 board has empty middle rows', () => {
		const board = createInitialBoard(8, STD);
		for (let row = 2; row <= 5; row++) {
			for (let col = 0; col < 8; col++) {
				expect(board[row]![col]).toBeNull();
			}
		}
	});

	test('10x10 board centers standard pieces', () => {
		const board = createInitialBoard(10, STD);
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
		const board = createInitialBoard(12, STD);
		expect(board.length).toBe(12);

		expect(board[0]![0]).toBeNull();
		expect(board[0]![1]).toBeNull();
		expect(board[0]![2]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![6]).toStrictEqual({type: 'king', color: 'black', hasMoved: false});
		expect(board[0]![9]).toStrictEqual({type: 'rook', color: 'black', hasMoved: false});
		expect(board[0]![10]).toBeNull();
		expect(board[0]![11]).toBeNull();
	});

	test('4x4 board with R B K R layout', () => {
		const pieces4 = new Set(['king', 'rook', 'bishop', 'pawn']);
		const board = createInitialBoard(4, pieces4);
		expect(board.length).toBe(4);

		expect(board[0]![0]?.type).toBe('rook');
		expect(board[0]![1]?.type).toBe('bishop');
		expect(board[0]![2]?.type).toBe('king');
		expect(board[0]![3]?.type).toBe('rook');

		for (let col = 0; col < 4; col++) {
			expect(board[1]![col]?.type).toBe('pawn');
			expect(board[2]![col]?.type).toBe('pawn');
		}
	});

	test('6x6 board with R B Q K B R layout', () => {
		const pieces6 = new Set(['king', 'queen', 'rook', 'bishop', 'pawn']);
		const board = createInitialBoard(6, pieces6);
		expect(board.length).toBe(6);

		expect(board[0]![0]?.type).toBe('rook');
		expect(board[0]![1]?.type).toBe('bishop');
		expect(board[0]![2]?.type).toBe('queen');
		expect(board[0]![3]?.type).toBe('king');
		expect(board[0]![4]?.type).toBe('bishop');
		expect(board[0]![5]?.type).toBe('rook');
	});
});

describe('buildBackRank', () => {
	test('standard 8-piece back rank', () => {
		const rank = buildBackRank(STD);
		expect(rank).toStrictEqual(['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']);
	});

	test('archbishop adds two pieces symmetrically', () => {
		const rank = buildBackRank(withPieces('archbishop'));
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
		const rank = buildBackRank(withPieces('chancellor'));
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

	test('all extra pieces', () => {
		const rank = buildBackRank(withPieces('archbishop', 'chancellor', 'centaur'));
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
		const rank = buildBackRank(withPieces('centaur'));
		expect(rank).toStrictEqual(['rook', 'knight', 'bishop', 'queen', 'centaur', 'bishop', 'knight', 'rook']);
	});

	test('disabling rooks removes them', () => {
		const pieces = new Set(['king', 'queen', 'bishop', 'knight', 'pawn']);
		const rank = buildBackRank(pieces);
		expect(rank).not.toContain('rook');
		expect(rank).toStrictEqual(['knight', 'bishop', 'queen', 'king', 'bishop', 'knight']);
	});

	test('disabling bishops removes them', () => {
		const pieces = new Set(['king', 'queen', 'rook', 'knight', 'pawn']);
		const rank = buildBackRank(pieces);
		expect(rank).not.toContain('bishop');
		expect(rank).toStrictEqual(['rook', 'knight', 'queen', 'king', 'knight', 'rook']);
	});

	test('trimming with fairy pieces on 10x10 keeps them and removes knights', () => {
		const rank = buildBackRank(withPieces('archbishop', 'chancellor'), 10);
		expect(rank).not.toContain('knight');
		expect(rank).toContain('archbishop');
		expect(rank).toContain('chancellor');
		expect(rank.length).toBe(10);
	});

	test('trimming always keeps the royal piece', () => {
		for (const size of [4, 6, 8, 10]) {
			const rank = buildBackRank(withPieces('archbishop', 'chancellor', 'centaur'), size);
			expect(rank).toContain('centaur');
			expect(rank.length).toBeLessThanOrEqual(size);
		}
	});
});
