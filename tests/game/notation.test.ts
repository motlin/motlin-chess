import {describe, expect, test} from 'vite-plus/test';
import type {GameSettings, Move, Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {
	colToFile,
	formatMovetext,
	formatPgn,
	generateMoveNotations,
	moveToSan,
	positionToSquare,
	rowToRank,
} from '../../src/game/notation.js';
import {createInitialBoard} from '../../src/game/boardSetup.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

const wKing: Piece = {type: 'king', color: 'white', hasMoved: false};
const bKing: Piece = {type: 'king', color: 'black', hasMoved: false};
const wRook: Piece = {type: 'rook', color: 'white', hasMoved: false};
const wRookMoved: Piece = {type: 'rook', color: 'white', hasMoved: true};
const bRook: Piece = {type: 'rook', color: 'black', hasMoved: false};
const wPawn: Piece = {type: 'pawn', color: 'white', hasMoved: false};
const bPawn: Piece = {type: 'pawn', color: 'black', hasMoved: false};
const wQueen: Piece = {type: 'queen', color: 'white', hasMoved: false};
const wBishop: Piece = {type: 'bishop', color: 'white', hasMoved: false};
const wKnight: Piece = {type: 'knight', color: 'white', hasMoved: false};
const standardPieces = new Set(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']);

const defaultSettings: GameSettings = {
	boardSize: 8,
	enabledPieces: standardPieces,
	pieceSet: 'cburnett',
	boardTheme: 'brown',
	duckChess: false,
};

describe('colToFile', () => {
	test('converts column 0 to a', () => {
		expect(colToFile(0)).toBe('a');
	});

	test('converts column 7 to h', () => {
		expect(colToFile(7)).toBe('h');
	});

	test('converts column 15 to p', () => {
		expect(colToFile(15)).toBe('p');
	});

	test('converts column 4 to e', () => {
		expect(colToFile(4)).toBe('e');
	});
});

describe('rowToRank', () => {
	test('converts row 7 on 8x8 to 1', () => {
		expect(rowToRank(7, 8)).toBe('1');
	});

	test('converts row 0 on 8x8 to 8', () => {
		expect(rowToRank(0, 8)).toBe('8');
	});

	test('converts row 6 on 8x8 to 2', () => {
		expect(rowToRank(6, 8)).toBe('2');
	});

	test('converts row 0 on 4x4 to 4', () => {
		expect(rowToRank(0, 4)).toBe('4');
	});

	test('converts row 3 on 4x4 to 1', () => {
		expect(rowToRank(3, 4)).toBe('1');
	});

	test('converts row 0 on 10x10 to 10', () => {
		expect(rowToRank(0, 10)).toBe('10');
	});

	test('converts row 9 on 10x10 to 1', () => {
		expect(rowToRank(9, 10)).toBe('1');
	});

	test('converts row 0 on 16x16 to 16', () => {
		expect(rowToRank(0, 16)).toBe('16');
	});
});

describe('positionToSquare', () => {
	test('converts e2 position on 8x8', () => {
		expect(positionToSquare({row: 6, col: 4}, 8)).toBe('e2');
	});

	test('converts a1 position on 8x8', () => {
		expect(positionToSquare({row: 7, col: 0}, 8)).toBe('a1');
	});

	test('converts h8 position on 8x8', () => {
		expect(positionToSquare({row: 0, col: 7}, 8)).toBe('h8');
	});

	test('converts position on 4x4', () => {
		expect(positionToSquare({row: 3, col: 0}, 4)).toBe('a1');
	});

	test('converts position on 10x10', () => {
		expect(positionToSquare({row: 0, col: 9}, 10)).toBe('j10');
	});
});

describe('moveToSan', () => {
	test('pawn push', () => {
		const board = createInitialBoard(8, standardPieces);
		const move: Move = {
			from: {row: 6, col: 4},
			to: {row: 4, col: 4},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('e4');
	});

	test('pawn capture', () => {
		let board = emptyBoard(8);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(4, 4, wPawn);
		board = board.withPiece(3, 3, bPawn);
		const move: Move = {
			from: {row: 4, col: 4},
			to: {row: 3, col: 3},
			captured: bPawn,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('exd5');
	});

	test('knight move', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(7, 1, wKnight);
		const move: Move = {
			from: {row: 7, col: 1},
			to: {row: 5, col: 2},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Nc3');
	});

	test('knight capture', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(7, 1, wKnight);
		board = board.withPiece(5, 2, bPawn);
		const move: Move = {
			from: {row: 7, col: 1},
			to: {row: 5, col: 2},
			captured: bPawn,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Nxc3');
	});

	test('kingside castling', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(7, 7, wRook);
		board = board.withPiece(0, 4, bKing);
		const move: Move = {
			from: {row: 7, col: 4},
			to: {row: 7, col: 6},
			captured: null,
			isEnPassant: false,
			isCastle: true,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('O-O');
	});

	test('queenside castling', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(7, 0, wRook);
		board = board.withPiece(0, 4, bKing);
		const move: Move = {
			from: {row: 7, col: 4},
			to: {row: 7, col: 2},
			captured: null,
			isEnPassant: false,
			isCastle: true,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('O-O-O');
	});

	test('pawn promotion', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(1, 0, wPawn);
		const move: Move = {
			from: {row: 1, col: 0},
			to: {row: 0, col: 0},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: 'queen',
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('a8=Q');
	});

	test('pawn capture promotion', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(1, 0, wPawn);
		board = board.withPiece(0, 1, bRook);
		const move: Move = {
			from: {row: 1, col: 0},
			to: {row: 0, col: 1},
			captured: bRook,
			isEnPassant: false,
			isCastle: false,
			promotion: 'queen',
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('axb8=Q');
	});

	test('en passant capture', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(3, 4, wPawn);
		board = board.withPiece(3, 3, bPawn);
		const move: Move = {
			from: {row: 3, col: 4},
			to: {row: 2, col: 3},
			captured: null,
			isEnPassant: true,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, {row: 2, col: 3}, 'playing')).toBe('exd6');
	});

	test('move with check suffix', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(6, 0, wRook);
		const checkMove: Move = {
			from: {row: 6, col: 0},
			to: {row: 0, col: 0},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, checkMove, 8, null, 'check')).toBe('Ra8+');
	});

	test('move with checkmate suffix', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(1, 0, wRook);
		board = board.withPiece(6, 7, wRookMoved);
		const move: Move = {
			from: {row: 6, col: 7},
			to: {row: 0, col: 7},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'checkmate')).toBe('Rh8#');
	});

	test('disambiguation by file for two rooks on same rank', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(4, 0, wRookMoved);
		board = board.withPiece(4, 7, wRookMoved);
		const move: Move = {
			from: {row: 4, col: 0},
			to: {row: 4, col: 3},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Rad4');
	});

	test('disambiguation by rank for two rooks on same file', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(2, 0, wRookMoved);
		board = board.withPiece(6, 0, wRookMoved);
		const move: Move = {
			from: {row: 2, col: 0},
			to: {row: 4, col: 0},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('R6a4');
	});

	test('disambiguation by file and rank for two knights', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		// Place two knights that can reach the same square
		// Knights at c3 (row 5, col 2) and e3 (row 5, col 4) can both reach d5 (row 3, col 3)
		// Actually c3 knight can reach d5: +2/-1 -> row 3, col 3. Yes.
		// e3 knight: row 5, col 4 to row 3, col 3: -2/-1. Yes.
		const wKnightMoved: Piece = {type: 'knight', color: 'white', hasMoved: true};
		board = board.withPiece(5, 2, wKnightMoved);
		board = board.withPiece(5, 4, wKnightMoved);
		const move: Move = {
			from: {row: 5, col: 2},
			to: {row: 3, col: 3},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Ncd5');
	});

	test('queen move no disambiguation needed', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(7, 3, wQueen);
		const move: Move = {
			from: {row: 7, col: 3},
			to: {row: 3, col: 3},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Qd5');
	});

	test('bishop move', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		board = board.withPiece(7, 2, wBishop);
		const move: Move = {
			from: {row: 7, col: 2},
			to: {row: 4, col: 5},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Bf4');
	});

	test('king move', () => {
		let board = emptyBoard(8);
		board = board.withPiece(4, 4, wKing);
		board = board.withPiece(0, 0, bKing);
		const move: Move = {
			from: {row: 4, col: 4},
			to: {row: 3, col: 4},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Ke5');
	});
});

describe('moveToSan with fairy pieces', () => {
	test('archbishop move', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		const wArchbishop: Piece = {type: 'archbishop', color: 'white', hasMoved: false};
		board = board.withPiece(4, 4, wArchbishop);
		const move: Move = {
			from: {row: 4, col: 4},
			to: {row: 2, col: 3},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Ad6');
	});

	test('chancellor move', () => {
		let board = emptyBoard(8);
		board = board.withPiece(7, 4, wKing);
		board = board.withPiece(0, 4, bKing);
		const wChancellor: Piece = {type: 'chancellor', color: 'white', hasMoved: false};
		board = board.withPiece(4, 4, wChancellor);
		const move: Move = {
			from: {row: 4, col: 4},
			to: {row: 4, col: 0},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Ca4');
	});

	test('centaur move', () => {
		let board = emptyBoard(8);
		const wCentaur: Piece = {type: 'centaur', color: 'white', hasMoved: false};
		board = board.withPiece(7, 4, wCentaur);
		board = board.withPiece(0, 4, bKing);
		const move: Move = {
			from: {row: 7, col: 4},
			to: {row: 5, col: 3},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('Ud3');
	});

	test('centaur kingside castling', () => {
		let board = emptyBoard(8);
		const wCentaur: Piece = {type: 'centaur', color: 'white', hasMoved: false};
		board = board.withPiece(7, 4, wCentaur);
		board = board.withPiece(7, 7, wRook);
		board = board.withPiece(0, 4, bKing);
		const move: Move = {
			from: {row: 7, col: 4},
			to: {row: 7, col: 6},
			captured: null,
			isEnPassant: false,
			isCastle: true,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('O-O');
	});

	test('centaur queenside castling', () => {
		let board = emptyBoard(8);
		const wCentaur: Piece = {type: 'centaur', color: 'white', hasMoved: false};
		board = board.withPiece(7, 4, wCentaur);
		board = board.withPiece(7, 0, wRook);
		board = board.withPiece(0, 4, bKing);
		const move: Move = {
			from: {row: 7, col: 4},
			to: {row: 7, col: 2},
			captured: null,
			isEnPassant: false,
			isCastle: true,
			promotion: null,
		};
		expect(moveToSan(board, move, 8, null, 'playing')).toBe('O-O-O');
	});
});

describe('generateMoveNotations', () => {
	test("Scholar's mate", () => {
		const moves: Move[] = [
			// 1. e4
			{
				from: {row: 6, col: 4},
				to: {row: 4, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 1... e5
			{
				from: {row: 1, col: 4},
				to: {row: 3, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 2. Bc4
			{
				from: {row: 7, col: 5},
				to: {row: 4, col: 2},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 2... Nc6
			{
				from: {row: 0, col: 1},
				to: {row: 2, col: 2},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 3. Qh5
			{
				from: {row: 7, col: 3},
				to: {row: 3, col: 7},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 3... Nf6
			{
				from: {row: 0, col: 6},
				to: {row: 2, col: 5},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 4. Qxf7#
			{
				from: {row: 3, col: 7},
				to: {row: 1, col: 5},
				captured: {type: 'pawn', color: 'black', hasMoved: false},
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
		];
		const sans = generateMoveNotations(defaultSettings, moves, 'checkmate');
		expect(sans).toStrictEqual(['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#']);
	});

	test('game with en passant', () => {
		const moves: Move[] = [
			// 1. e4
			{
				from: {row: 6, col: 4},
				to: {row: 4, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 1... a6
			{
				from: {row: 1, col: 0},
				to: {row: 2, col: 0},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 2. e5
			{
				from: {row: 4, col: 4},
				to: {row: 3, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 2... d5 (creates en passant target)
			{
				from: {row: 1, col: 3},
				to: {row: 3, col: 3},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			// 3. exd6 (en passant)
			{
				from: {row: 3, col: 4},
				to: {row: 2, col: 3},
				captured: null,
				isEnPassant: true,
				isCastle: false,
				promotion: null,
			},
		];
		const sans = generateMoveNotations(defaultSettings, moves, 'playing');
		expect(sans).toStrictEqual(['e4', 'a6', 'e5', 'd5', 'exd6']);
	});
});

describe('formatMovetext', () => {
	test('formats even number of moves', () => {
		expect(formatMovetext(['e4', 'e5', 'Nf3', 'Nc6'])).toBe('1. e4 e5 2. Nf3 Nc6');
	});

	test('formats odd number of moves', () => {
		expect(formatMovetext(['e4', 'e5', 'Nf3'])).toBe('1. e4 e5 2. Nf3');
	});

	test('formats single move', () => {
		expect(formatMovetext(['e4'])).toBe('1. e4');
	});

	test('formats empty list', () => {
		expect(formatMovetext([])).toBe('');
	});
});

describe('formatPgn', () => {
	test('includes Seven Tag Roster headers', () => {
		const moves: Move[] = [
			{
				from: {row: 6, col: 4},
				to: {row: 4, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
		];
		const pgn = formatPgn(defaultSettings, moves, 'playing');
		expect(pgn).toContain('[Event "Casual Game"]');
		expect(pgn).toContain('[Site "motlin-chess"]');
		expect(pgn).toContain('[White "White"]');
		expect(pgn).toContain('[Black "Black"]');
		expect(pgn).toContain('[Result "*"]');
		expect(pgn).toContain('1. e4');
	});

	test('result is 1-0 for checkmate on black turn', () => {
		const moves: Move[] = [
			{
				from: {row: 6, col: 4},
				to: {row: 4, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			{
				from: {row: 1, col: 4},
				to: {row: 3, col: 4},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			{
				from: {row: 7, col: 5},
				to: {row: 4, col: 2},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			{
				from: {row: 0, col: 1},
				to: {row: 2, col: 2},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			{
				from: {row: 7, col: 3},
				to: {row: 3, col: 7},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			{
				from: {row: 0, col: 6},
				to: {row: 2, col: 5},
				captured: null,
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
			{
				from: {row: 3, col: 7},
				to: {row: 1, col: 5},
				captured: {type: 'pawn', color: 'black', hasMoved: false},
				isEnPassant: false,
				isCastle: false,
				promotion: null,
			},
		];
		const pgn = formatPgn(defaultSettings, moves, 'checkmate');
		expect(pgn).toContain('[Result "1-0"]');
		expect(pgn).toContain('1-0');
	});

	test('result is 1/2-1/2 for stalemate', () => {
		const pgn = formatPgn(defaultSettings, [], 'stalemate');
		expect(pgn).toContain('[Result "1/2-1/2"]');
	});
});
