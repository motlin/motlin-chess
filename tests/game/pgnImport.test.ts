import {describe, expect, test} from 'vite-plus/test';
import type {GameSettings, Move} from '../../src/types.js';
import {parsePgn, findMoveForSan, importPgn} from '../../src/game/pgnImport.js';
import {createInitialBoard} from '../../src/game/boardSetup.js';
import {formatPgn} from '../../src/game/notation.js';

const standardPieces = new Set(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']);

const defaultSettings: GameSettings = {
	boardSize: 8,
	enabledPieces: standardPieces,
	pieceSet: 'cburnett',
	boardTheme: 'brown',
	duckChess: false,
};

describe('parsePgn', () => {
	test('parses simple movetext without headers', () => {
		const result = parsePgn('1. e4 e5 2. Nf3 Nc6');
		expect(result.headers).toStrictEqual({});
		expect(result.moves).toStrictEqual(['e4', 'e5', 'Nf3', 'Nc6']);
	});

	test('parses PGN with headers', () => {
		const pgn = `[Event "Casual Game"]
[Site "motlin-chess"]
[Date "2026.04.30"]
[Round "-"]
[White "White"]
[Black "Black"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0
`;
		const result = parsePgn(pgn);
		expect(result.headers['Event']).toBe('Casual Game');
		expect(result.headers['Site']).toBe('motlin-chess');
		expect(result.headers['Date']).toBe('2026.04.30');
		expect(result.headers['White']).toBe('White');
		expect(result.headers['Black']).toBe('Black');
		expect(result.headers['Result']).toBe('1-0');
		expect(result.moves).toStrictEqual(['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#']);
	});

	test('strips result tokens from moves', () => {
		const result = parsePgn('1. e4 e5 1/2-1/2');
		expect(result.moves).toStrictEqual(['e4', 'e5']);
	});

	test('handles result token *', () => {
		const result = parsePgn('1. e4 e5 *');
		expect(result.moves).toStrictEqual(['e4', 'e5']);
	});

	test('handles result token 0-1', () => {
		const result = parsePgn('1. e4 0-1');
		expect(result.moves).toStrictEqual(['e4']);
	});

	test('parses movetext with check and checkmate annotations', () => {
		const result = parsePgn('1. e4 e5 2. Qh5 Nc6 3. Qxf7#');
		expect(result.moves).toStrictEqual(['e4', 'e5', 'Qh5', 'Nc6', 'Qxf7#']);
	});

	test('returns empty moves for empty input', () => {
		const result = parsePgn('');
		expect(result.headers).toStrictEqual({});
		expect(result.moves).toStrictEqual([]);
	});

	test('parses movetext with comments stripped', () => {
		const result = parsePgn('1. e4 {best move} e5 2. Nf3 Nc6');
		expect(result.moves).toStrictEqual(['e4', 'e5', 'Nf3', 'Nc6']);
	});

	test('parses movetext with nested parenthesized variations stripped', () => {
		const result = parsePgn('1. e4 e5 (1... c5 2. Nf3) 2. Nf3 Nc6');
		expect(result.moves).toStrictEqual(['e4', 'e5', 'Nf3', 'Nc6']);
	});
});

describe('findMoveForSan', () => {
	test('finds pawn push e4', () => {
		const board = createInitialBoard(8, standardPieces);
		const move = findMoveForSan('e4', board, 'white', 8, null);
		expect(move).not.toBeNull();
		expect(move!.from).toStrictEqual({row: 6, col: 4});
		expect(move!.to).toStrictEqual({row: 4, col: 4});
	});

	test('finds knight move Nf3', () => {
		const board = createInitialBoard(8, standardPieces);
		const move = findMoveForSan('Nf3', board, 'white', 8, null);
		expect(move).not.toBeNull();
		expect(move!.from).toStrictEqual({row: 7, col: 6});
		expect(move!.to).toStrictEqual({row: 5, col: 5});
	});

	test('returns null for illegal move', () => {
		const board = createInitialBoard(8, standardPieces);
		const move = findMoveForSan('Ke2', board, 'white', 8, null);
		expect(move).toBeNull();
	});

	test('strips check suffix when matching', () => {
		const board = createInitialBoard(8, standardPieces);
		const move = findMoveForSan('e4+', board, 'white', 8, null);
		expect(move).not.toBeNull();
		expect(move!.to).toStrictEqual({row: 4, col: 4});
	});

	test('strips checkmate suffix when matching', () => {
		const board = createInitialBoard(8, standardPieces);
		const move = findMoveForSan('e4#', board, 'white', 8, null);
		expect(move).not.toBeNull();
		expect(move!.to).toStrictEqual({row: 4, col: 4});
	});
});

describe('importPgn', () => {
	test("imports Scholar's mate", () => {
		const pgn = '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#';
		const state = importPgn(pgn, defaultSettings);
		expect(state.moveHistory).toHaveLength(7);
		expect(state.gameStatus).toBe('checkmate');
		expect(state.currentTurn).toBe('black');
	});

	test('imports a game and produces correct move history for undo', () => {
		const pgn = '1. e4 e5 2. Nf3 Nc6';
		const state = importPgn(pgn, defaultSettings);
		expect(state.moveHistory).toHaveLength(4);
		expect(state.gameStatus).toBe('playing');
		expect(state.currentTurn).toBe('white');
	});

	test('imports PGN with headers', () => {
		const pgn = `[Event "Test"]
[Result "*"]

1. d4 d5 2. c4 e6 *
`;
		const state = importPgn(pgn, defaultSettings);
		expect(state.moveHistory).toHaveLength(4);
		expect(state.currentTurn).toBe('white');
	});

	test('throws on invalid move in PGN', () => {
		const pgn = '1. e4 e5 2. Nf3 Rg1';
		expect(() => importPgn(pgn, defaultSettings)).toThrow();
	});

	test('round-trip: export to PGN and import back produces identical move history', () => {
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
				from: {row: 7, col: 6},
				to: {row: 5, col: 5},
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
		];
		const pgn = formatPgn(defaultSettings, moves, 'playing');
		const state = importPgn(pgn, defaultSettings);
		expect(state.moveHistory).toHaveLength(4);
		for (let i = 0; i < moves.length; i++) {
			expect(state.moveHistory[i]!.from).toStrictEqual(moves[i]!.from);
			expect(state.moveHistory[i]!.to).toStrictEqual(moves[i]!.to);
		}
	});

	test('imports game with castling', () => {
		const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6';
		const state = importPgn(pgn, defaultSettings);
		expect(state.moveHistory).toHaveLength(8);
		const castleMove = state.moveHistory[6]!;
		expect(castleMove.isCastle).toBe(true);
	});

	test('imports game with en passant', () => {
		const pgn = '1. e4 a6 2. e5 d5 3. exd6';
		const state = importPgn(pgn, defaultSettings);
		expect(state.moveHistory).toHaveLength(5);
		const enPassantMove = state.moveHistory[4]!;
		expect(enPassantMove.isEnPassant).toBe(true);
	});

	test('imports game with promotion', () => {
		const pgn = '1. a4 b5 2. axb5 a6 3. bxa6 Nc6 4. a7 Rb8 5. a8=Q';
		const state = importPgn(pgn, defaultSettings);
		const lastMove = state.moveHistory[state.moveHistory.length - 1]!;
		expect(lastMove.promotion).toBe('queen');
	});

	test('imports empty PGN as initial state', () => {
		const state = importPgn('', defaultSettings);
		expect(state.moveHistory).toHaveLength(0);
		expect(state.gameStatus).toBe('playing');
	});
});
