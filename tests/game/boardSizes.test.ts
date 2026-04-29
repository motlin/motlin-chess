import {describe, expect, test} from 'vite-plus/test';
import type {GameState, Piece} from '../../src/types.js';
import {Board} from '../../src/types.js';
import {
	applyMove,
	completePromotion,
	getGameStatus,
	getLegalMoves,
	isInCheck,
	selectSquare,
} from '../../src/game/gameLogic.js';
import {createInitialBoard} from '../../src/game/boardSetup.js';

function emptyBoard(size: number): Board {
	return Board.empty(size);
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	return board.withPiece(row, col, piece);
}

const wKing: Piece = {type: 'king', color: 'white', hasMoved: false};
const bKing: Piece = {type: 'king', color: 'black', hasMoved: false};
const wRook: Piece = {type: 'rook', color: 'white', hasMoved: false};
const bRook: Piece = {type: 'rook', color: 'black', hasMoved: false};
const wPawn: Piece = {type: 'pawn', color: 'white', hasMoved: false};
const bPawn: Piece = {type: 'pawn', color: 'black', hasMoved: false};
const STD = new Set(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']);

describe('pawn movement on various board sizes', () => {
	test('white pawn moves forward 1 or 2 from starting row on 10x10', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 8, 4, wPawn);
		board = placePiece(board, 0, 0, bKing);
		board = placePiece(board, 9, 4, wKing);
		const moves = getLegalMoves(board, {row: 8, col: 4}, 10, null);
		expect(moves.some((m) => m.to.row === 7 && m.to.col === 4)).toBe(true);
		expect(moves.some((m) => m.to.row === 6 && m.to.col === 4)).toBe(true);
	});

	test('black pawn moves forward 1 or 2 from starting row on 10x10', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 1, 4, bPawn);
		board = placePiece(board, 0, 0, bKing);
		board = placePiece(board, 9, 9, wKing);
		const moves = getLegalMoves(board, {row: 1, col: 4}, 10, null);
		expect(moves.some((m) => m.to.row === 2 && m.to.col === 4)).toBe(true);
		expect(moves.some((m) => m.to.row === 3 && m.to.col === 4)).toBe(true);
	});

	test('white pawn on 4x4 starts on row 2 and can double-step', () => {
		let board = emptyBoard(4);
		board = placePiece(board, 2, 1, wPawn);
		board = placePiece(board, 3, 0, wKing);
		board = placePiece(board, 0, 3, bKing);
		const moves = getLegalMoves(board, {row: 2, col: 1}, 4, null);
		expect(moves.some((m) => m.to.row === 1 && m.to.col === 1)).toBe(true);
		expect(moves.some((m) => m.to.row === 0 && m.to.col === 1)).toBe(true);
	});

	test('pawn cannot double-step after moving on 12x12', () => {
		let board = emptyBoard(12);
		const movedPawn: Piece = {type: 'pawn', color: 'white', hasMoved: true};
		board = placePiece(board, 9, 5, movedPawn);
		board = placePiece(board, 11, 5, wKing);
		board = placePiece(board, 0, 5, bKing);
		const moves = getLegalMoves(board, {row: 9, col: 5}, 12, null);
		expect(moves.some((m) => m.to.row === 7)).toBe(false);
		expect(moves.some((m) => m.to.row === 8)).toBe(true);
	});
});

describe('pawn promotion on various board sizes', () => {
	test('white pawn promotes on row 0 of 4x4 board', () => {
		let board = emptyBoard(4);
		board = placePiece(board, 1, 1, wPawn);
		board = placePiece(board, 3, 0, wKing);
		board = placePiece(board, 0, 3, bKing);

		const state: GameState = {
			board,
			currentTurn: 'white',
			selectedPosition: null,
			validMoves: [],
			moveHistory: [],
			boardSize: 4,
			gameStatus: 'playing',
			enPassantTarget: null,
			pendingPromotion: null,
		};

		const selected = selectSquare(state, {row: 1, col: 1});
		const promoted = selectSquare(selected, {row: 0, col: 1});
		expect(promoted.pendingPromotion).not.toBeNull();
		const completed = completePromotion(promoted, 'queen');
		expect(completed.board.get(0, 1)?.type).toBe('queen');
		expect(completed.currentTurn).toBe('black');
	});

	test('white pawn promotes on row 0 of 10x10 board', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 1, 5, wPawn);
		board = placePiece(board, 9, 5, wKing);
		board = placePiece(board, 0, 0, bKing);
		const moves = getLegalMoves(board, {row: 1, col: 5}, 10, null);
		const promotionMoves = moves.filter((m) => m.promotion !== null);
		expect(promotionMoves.length).toBeGreaterThan(0);
		expect(promotionMoves.every((m) => m.to.row === 0)).toBe(true);
	});

	test('black pawn promotes on last row of 6x6 board', () => {
		let board = emptyBoard(6);
		board = placePiece(board, 4, 2, bPawn);
		board = placePiece(board, 0, 0, bKing);
		board = placePiece(board, 5, 5, wKing);
		const moves = getLegalMoves(board, {row: 4, col: 2}, 6, null);
		const promotionMoves = moves.filter((m) => m.promotion !== null);
		expect(promotionMoves.length).toBeGreaterThan(0);
		expect(promotionMoves.every((m) => m.to.row === 5)).toBe(true);
	});
});

describe('castling on various board sizes', () => {
	test('10x10 king-side castling moves rook correctly', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 9, 5, wKing);
		board = placePiece(board, 9, 8, wRook);
		board = placePiece(board, 0, 5, bKing);

		const moves = getLegalMoves(board, {row: 9, col: 5}, 10, null);
		const castleMove = moves.find((m) => m.isCastle && m.to.col === 7);
		expect(castleMove).toBeDefined();

		const newBoard = applyMove(board, castleMove!);
		expect(newBoard.get(9, 7)?.type).toBe('king');
		expect(newBoard.get(9, 6)?.type).toBe('rook');
		expect(newBoard.get(9, 5)).toBeNull();
		expect(newBoard.get(9, 8)).toBeNull();
	});

	test('10x10 queen-side castling moves rook correctly', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 9, 5, wKing);
		board = placePiece(board, 9, 1, wRook);
		board = placePiece(board, 0, 5, bKing);

		const moves = getLegalMoves(board, {row: 9, col: 5}, 10, null);
		const castleMove = moves.find((m) => m.isCastle && m.to.col === 3);
		expect(castleMove).toBeDefined();

		const newBoard = applyMove(board, castleMove!);
		expect(newBoard.get(9, 3)?.type).toBe('king');
		expect(newBoard.get(9, 4)?.type).toBe('rook');
		expect(newBoard.get(9, 5)).toBeNull();
		expect(newBoard.get(9, 1)).toBeNull();
	});

	test('12x12 king-side castling', () => {
		let board = emptyBoard(12);
		board = placePiece(board, 11, 6, wKing);
		board = placePiece(board, 11, 9, wRook);
		board = placePiece(board, 0, 6, bKing);

		const moves = getLegalMoves(board, {row: 11, col: 6}, 12, null);
		const castleMove = moves.find((m) => m.isCastle && m.to.col === 8);
		expect(castleMove).toBeDefined();

		const newBoard = applyMove(board, castleMove!);
		expect(newBoard.get(11, 8)?.type).toBe('king');
		expect(newBoard.get(11, 7)?.type).toBe('rook');
	});

	test('12x12 queen-side castling', () => {
		let board = emptyBoard(12);
		board = placePiece(board, 11, 6, wKing);
		board = placePiece(board, 11, 2, wRook);
		board = placePiece(board, 0, 6, bKing);

		const moves = getLegalMoves(board, {row: 11, col: 6}, 12, null);
		const castleMove = moves.find((m) => m.isCastle && m.to.col === 4);
		expect(castleMove).toBeDefined();

		const newBoard = applyMove(board, castleMove!);
		expect(newBoard.get(11, 4)?.type).toBe('king');
		expect(newBoard.get(11, 5)?.type).toBe('rook');
	});

	test('no castling on 4x4 board with R B K R layout', () => {
		const pieces4 = new Set(['king', 'rook', 'bishop', 'pawn']);
		const board = createInitialBoard(4, pieces4);
		let kingCol = 0;
		for (let col = 0; col < 4; col++) {
			if (board.get(3, col)?.type === 'king') {
				kingCol = col;
				break;
			}
		}
		const moves = getLegalMoves(board, {row: 3, col: kingCol}, 4, null);
		const castleMoves = moves.filter((m) => m.isCastle);
		expect(castleMoves.length).toBe(0);
	});

	test('castling blocked through check on 10x10', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 9, 5, wKing);
		board = placePiece(board, 9, 8, wRook);
		board = placePiece(board, 0, 6, bRook);
		board = placePiece(board, 0, 0, bKing);

		const moves = getLegalMoves(board, {row: 9, col: 5}, 10, null);
		const castleMove = moves.find((m) => m.isCastle && m.to.col === 7);
		expect(castleMove).toBeUndefined();
	});
});

describe('en passant on various board sizes', () => {
	test('en passant works on 10x10', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 3, 4, wPawn);
		board = placePiece(board, 3, 5, {...bPawn, hasMoved: true});
		board = placePiece(board, 9, 9, wKing);
		board = placePiece(board, 0, 0, bKing);

		const enPassantTarget = {row: 2, col: 5};
		const moves = getLegalMoves(board, {row: 3, col: 4}, 10, enPassantTarget);
		const epMove = moves.find((m) => m.to.row === 2 && m.to.col === 5);
		expect(epMove).toBeDefined();
		expect(epMove!.isEnPassant).toBe(true);
	});

	test('en passant captures remove pawn on 12x12', () => {
		let board = emptyBoard(12);
		board = placePiece(board, 5, 6, wPawn);
		board = placePiece(board, 5, 7, {...bPawn, hasMoved: true});
		board = placePiece(board, 11, 0, wKing);
		board = placePiece(board, 0, 0, bKing);

		const enPassantTarget = {row: 4, col: 7};
		const moves = getLegalMoves(board, {row: 5, col: 6}, 12, enPassantTarget);
		const epMove = moves.find((m) => m.to.row === 4 && m.to.col === 7);
		expect(epMove).toBeDefined();

		const newBoard = applyMove(board, epMove!);
		expect(newBoard.get(4, 7)?.type).toBe('pawn');
		expect(newBoard.get(4, 7)?.color).toBe('white');
		expect(newBoard.get(5, 7)).toBeNull();
		expect(newBoard.get(5, 6)).toBeNull();
	});
});

describe('check and checkmate on various board sizes', () => {
	test('check detection on 10x10', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 9, 5, wKing);
		board = placePiece(board, 0, 5, bRook);
		board = placePiece(board, 0, 0, bKing);
		expect(isInCheck(board, 'white', 10)).toBe(true);
	});

	test('checkmate on 6x6', () => {
		let board = emptyBoard(6);
		board = placePiece(board, 5, 0, wKing);
		const bQueen: Piece = {type: 'queen', color: 'black', hasMoved: false};
		board = placePiece(board, 4, 0, bQueen);
		board = placePiece(board, 4, 1, bRook);
		board = placePiece(board, 0, 5, bKing);
		expect(getGameStatus(board, 'white', 6, null)).toBe('checkmate');
	});

	test('stalemate on 4x4', () => {
		let board = emptyBoard(4);
		board = placePiece(board, 0, 0, wKing);
		const bQueen: Piece = {type: 'queen', color: 'black', hasMoved: false};
		board = placePiece(board, 2, 1, bQueen);
		board = placePiece(board, 1, 2, bKing);
		expect(getGameStatus(board, 'white', 4, null)).toBe('stalemate');
	});
});

describe('initial board correctness', () => {
	test('all board sizes have correct dimensions', () => {
		for (const size of [4, 6, 8, 10, 12, 14, 16]) {
			const board = createInitialBoard(size, STD);
			expect(board.size).toBe(size);
		}
	});

	test('all board sizes have pawns on rows 1 and boardSize-2', () => {
		for (const size of [4, 6, 8, 10, 12, 14, 16]) {
			const board = createInitialBoard(size, STD);
			for (let col = 0; col < size; col++) {
				expect(board.get(1, col)?.type).toBe('pawn');
				expect(board.get(1, col)?.color).toBe('black');
				expect(board.get(size - 2, col)?.type).toBe('pawn');
				expect(board.get(size - 2, col)?.color).toBe('white');
			}
		}
	});

	test('all board sizes have empty middle rows', () => {
		for (const size of [4, 6, 8, 10, 12, 14, 16]) {
			const board = createInitialBoard(size, STD);
			for (let row = 2; row < size - 2; row++) {
				for (let col = 0; col < size; col++) {
					expect(board.get(row, col)).toBeNull();
				}
			}
		}
	});

	test('all board sizes have exactly one king per side', () => {
		for (const size of [4, 6, 8, 10, 12, 14, 16]) {
			const board = createInitialBoard(size, STD);
			let whiteKings = 0;
			let blackKings = 0;
			for (let row = 0; row < size; row++) {
				for (let col = 0; col < size; col++) {
					const piece = board.get(row, col);
					if (piece?.type === 'king') {
						if (piece.color === 'white') whiteKings++;
						else blackKings++;
					}
				}
			}
			expect(whiteKings).toBe(1);
			expect(blackKings).toBe(1);
		}
	});

	test('back rank is symmetric on 8x8 and larger boards', () => {
		for (const size of [8, 10, 12, 14, 16]) {
			const board = createInitialBoard(size, STD);
			const backRank = Array.from({length: size}, (_, col) => board.get(0, col)?.type ?? null);
			const nonNull = backRank.filter((t) => t !== null);
			const offset = Math.floor((size - nonNull.length) / 2);

			for (let i = 0; i < Math.floor(nonNull.length / 2); i++) {
				const leftType = backRank[offset + i];
				const rightType = backRank[offset + nonNull.length - 1 - i];
				if (leftType === 'queen' || leftType === 'king') continue;
				expect(rightType).toBe(leftType);
			}
		}
	});

	test('with extra pieces enabled, board has correct piece count', () => {
		const allPieces = new Set([...STD, 'archbishop', 'chancellor']);
		const board = createInitialBoard(12, allPieces);
		const whitePieces: string[] = [];
		for (let col = 0; col < 12; col++) {
			const piece = board.get(11, col);
			if (piece !== null) {
				whitePieces.push(piece.type);
			}
		}
		expect(whitePieces.filter((t) => t === 'archbishop').length).toBe(2);
		expect(whitePieces.filter((t) => t === 'chancellor').length).toBe(2);
		expect(whitePieces.filter((t) => t === 'king').length).toBe(1);
	});
});
