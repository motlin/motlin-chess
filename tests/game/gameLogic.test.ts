import {describe, expect, test} from 'vite-plus/test';
import type {Board, GameState, Piece} from '../../src/types.js';
import {
	applyMove,
	completePromotion,
	createInitialGameState,
	getGameStatus,
	getLegalMoves,
	isInCheck,
	selectSquare,
} from '../../src/game/gameLogic.js';

function emptyBoard(size: number): Board {
	return Array.from({length: size}, () => Array.from<Piece | null>({length: size}).fill(null));
}

function placePiece(board: Board, row: number, col: number, piece: Piece): Board {
	const newBoard = board.map((r) => [...r]);
	newBoard[row]![col] = piece;
	return newBoard;
}

const wKing: Piece = {type: 'king', color: 'white', hasMoved: false};
const bKing: Piece = {type: 'king', color: 'black', hasMoved: false};
const wRook: Piece = {type: 'rook', color: 'white', hasMoved: false};
const bRook: Piece = {type: 'rook', color: 'black', hasMoved: false};
const wPawn: Piece = {type: 'pawn', color: 'white', hasMoved: false};
const bQueen: Piece = {type: 'queen', color: 'black', hasMoved: false};

describe('createInitialGameState', () => {
	test('creates valid initial state', () => {
		const state = createInitialGameState({
			boardSize: 8,
			enabledExtraPieces: new Set(),
			pieceSet: 'cburnett',
			boardTheme: 'brown',
		});
		expect(state.currentTurn).toBe('white');
		expect(state.gameStatus).toBe('playing');
		expect(state.boardSize).toBe(8);
		expect(state.moveHistory.length).toBe(0);
		expect(state.selectedPosition).toBeNull();
		expect(state.enPassantTarget).toBeNull();
		expect(state.pendingPromotion).toBeNull();
	});
});

describe('isInCheck', () => {
	test('detects check from rook', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 4, wKing);
		board = placePiece(board, 7, 4, bRook);
		board = placePiece(board, 7, 0, bKing);
		expect(isInCheck(board, 'white', 8)).toBe(true);
	});

	test('no check when path blocked', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 4, wKing);
		board = placePiece(board, 3, 4, wPawn);
		board = placePiece(board, 7, 4, bRook);
		board = placePiece(board, 7, 0, bKing);
		expect(isInCheck(board, 'white', 8)).toBe(false);
	});
});

describe('getLegalMoves', () => {
	test('king cannot move into check', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 0, wKing);
		board = placePiece(board, 7, 0, bRook);
		board = placePiece(board, 7, 7, bKing);
		const moves = getLegalMoves(board, {row: 0, col: 0}, 8, null);
		const illegalMove = moves.find((m) => m.to.col === 0);
		expect(illegalMove).toBeUndefined();
	});

	test('pinned piece cannot move off pin line', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 0, wKing);
		board = placePiece(board, 0, 1, wRook);
		board = placePiece(board, 0, 7, bRook);
		board = placePiece(board, 7, 7, bKing);
		const moves = getLegalMoves(board, {row: 0, col: 1}, 8, null);
		for (const move of moves) {
			expect(move.to.row).toBe(0);
		}
	});
});

describe('castling', () => {
	test('king-side castling available', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 7, 4, wKing);
		board = placePiece(board, 7, 7, wRook);
		board = placePiece(board, 0, 4, bKing);
		const moves = getLegalMoves(board, {row: 7, col: 4}, 8, null);
		const castleMove = moves.find((m) => m.to.col === 6 && m.isCastle);
		expect(castleMove).toBeDefined();
	});

	test('queen-side castling available', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 7, 4, wKing);
		board = placePiece(board, 7, 0, wRook);
		board = placePiece(board, 0, 4, bKing);
		const moves = getLegalMoves(board, {row: 7, col: 4}, 8, null);
		const castleMove = moves.find((m) => m.to.col === 2 && m.isCastle);
		expect(castleMove).toBeDefined();
	});

	test('castling blocked by piece between', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 7, 4, wKing);
		board = placePiece(board, 7, 7, wRook);
		board = placePiece(board, 7, 5, {type: 'bishop', color: 'white', hasMoved: false});
		board = placePiece(board, 0, 4, bKing);
		const moves = getLegalMoves(board, {row: 7, col: 4}, 8, null);
		const castleMove = moves.find((m) => m.isCastle);
		expect(castleMove).toBeUndefined();
	});

	test('castling not allowed when king has moved', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 7, 4, {...wKing, hasMoved: true});
		board = placePiece(board, 7, 7, wRook);
		board = placePiece(board, 0, 4, bKing);
		const moves = getLegalMoves(board, {row: 7, col: 4}, 8, null);
		const castleMove = moves.find((m) => m.isCastle);
		expect(castleMove).toBeUndefined();
	});

	test('castling not allowed through check', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 7, 4, wKing);
		board = placePiece(board, 7, 7, wRook);
		board = placePiece(board, 0, 5, bRook);
		board = placePiece(board, 0, 0, bKing);
		const moves = getLegalMoves(board, {row: 7, col: 4}, 8, null);
		const castleMove = moves.find((m) => m.isCastle && m.to.col === 6);
		expect(castleMove).toBeUndefined();
	});

	test('castling on 10x10 board', () => {
		let board = emptyBoard(10);
		board = placePiece(board, 9, 5, wKing);
		board = placePiece(board, 9, 8, wRook);
		board = placePiece(board, 0, 5, bKing);
		const moves = getLegalMoves(board, {row: 9, col: 5}, 10, null);
		const castleMove = moves.find((m) => m.isCastle);
		expect(castleMove).toBeDefined();
	});
});

describe('applyMove', () => {
	test('moves piece to new position', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 6, 4, wPawn);
		const newBoard = applyMove(board, {
			from: {row: 6, col: 4},
			to: {row: 4, col: 4},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: null,
		});
		expect(newBoard[6]![4]).toBeNull();
		expect(newBoard[4]![4]?.type).toBe('pawn');
		expect(newBoard[4]![4]?.hasMoved).toBe(true);
	});

	test('en passant removes captured pawn', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 3, 3, wPawn);
		board = placePiece(board, 3, 4, {type: 'pawn', color: 'black', hasMoved: true});
		const newBoard = applyMove(board, {
			from: {row: 3, col: 3},
			to: {row: 2, col: 4},
			captured: {type: 'pawn', color: 'black', hasMoved: true},
			isEnPassant: true,
			isCastle: false,
			promotion: null,
		});
		expect(newBoard[3]![4]).toBeNull();
		expect(newBoard[2]![4]?.color).toBe('white');
	});

	test('castling moves rook', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 7, 4, wKing);
		board = placePiece(board, 7, 7, wRook);
		const newBoard = applyMove(board, {
			from: {row: 7, col: 4},
			to: {row: 7, col: 6},
			captured: null,
			isEnPassant: false,
			isCastle: true,
			promotion: null,
		});
		expect(newBoard[7]![6]?.type).toBe('king');
		expect(newBoard[7]![5]?.type).toBe('rook');
		expect(newBoard[7]![7]).toBeNull();
		expect(newBoard[7]![4]).toBeNull();
	});

	test('promotion changes piece type', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 1, 3, wPawn);
		const newBoard = applyMove(board, {
			from: {row: 1, col: 3},
			to: {row: 0, col: 3},
			captured: null,
			isEnPassant: false,
			isCastle: false,
			promotion: 'queen',
		});
		expect(newBoard[0]![3]?.type).toBe('queen');
		expect(newBoard[0]![3]?.color).toBe('white');
	});
});

describe('getGameStatus', () => {
	test('checkmate detection', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 0, wKing);
		board = placePiece(board, 1, 0, bQueen);
		board = placePiece(board, 1, 1, bRook);
		board = placePiece(board, 7, 7, bKing);
		const status = getGameStatus(board, 'white', 8, null);
		expect(status).toBe('checkmate');
	});

	test('stalemate detection', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 0, wKing);
		board = placePiece(board, 2, 1, bQueen);
		board = placePiece(board, 1, 2, bKing);
		const status = getGameStatus(board, 'white', 8, null);
		expect(status).toBe('stalemate');
	});

	test('check but not checkmate', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 0, 0, wKing);
		board = placePiece(board, 0, 7, bRook);
		board = placePiece(board, 7, 7, bKing);
		const status = getGameStatus(board, 'white', 8, null);
		expect(status).toBe('check');
	});
});

describe('selectSquare', () => {
	test('selecting own piece shows valid moves', () => {
		const state = createInitialGameState({
			boardSize: 8,
			enabledExtraPieces: new Set(),
			pieceSet: 'cburnett',
			boardTheme: 'brown',
		});
		const newState = selectSquare(state, {row: 6, col: 4});
		expect(newState.selectedPosition).toStrictEqual({row: 6, col: 4});
		expect(newState.validMoves.length).toBeGreaterThan(0);
	});

	test('selecting empty square with no selection does nothing', () => {
		const state = createInitialGameState({
			boardSize: 8,
			enabledExtraPieces: new Set(),
			pieceSet: 'cburnett',
			boardTheme: 'brown',
		});
		const newState = selectSquare(state, {row: 4, col: 4});
		expect(newState).toBe(state);
	});

	test('selecting opponent piece does nothing', () => {
		const state = createInitialGameState({
			boardSize: 8,
			enabledExtraPieces: new Set(),
			pieceSet: 'cburnett',
			boardTheme: 'brown',
		});
		const newState = selectSquare(state, {row: 1, col: 4});
		expect(newState).toBe(state);
	});

	test('clicking selected piece again deselects it', () => {
		const state = createInitialGameState({
			boardSize: 8,
			enabledExtraPieces: new Set(),
			pieceSet: 'cburnett',
			boardTheme: 'brown',
		});
		const selected = selectSquare(state, {row: 6, col: 4});
		expect(selected.selectedPosition).toStrictEqual({row: 6, col: 4});
		const deselected = selectSquare(selected, {row: 6, col: 4});
		expect(deselected.selectedPosition).toBeNull();
		expect(deselected.validMoves).toStrictEqual([]);
	});

	test('executing a valid move changes turn', () => {
		const state = createInitialGameState({
			boardSize: 8,
			enabledExtraPieces: new Set(),
			pieceSet: 'cburnett',
			boardTheme: 'brown',
		});
		const selected = selectSquare(state, {row: 6, col: 4});
		const moved = selectSquare(selected, {row: 4, col: 4});
		expect(moved.currentTurn).toBe('black');
		expect(moved.selectedPosition).toBeNull();
	});
});

describe('pawn promotion flow', () => {
	test('moving pawn to promotion rank triggers pending promotion', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 1, 3, wPawn);
		board = placePiece(board, 7, 7, wKing);
		board = placePiece(board, 0, 0, bKing);

		const state: GameState = {
			board,
			currentTurn: 'white',
			selectedPosition: null,
			validMoves: [],
			moveHistory: [],
			boardSize: 8,
			gameStatus: 'playing',
			enPassantTarget: null,
			pendingPromotion: null,
		};

		const selected = selectSquare(state, {row: 1, col: 3});
		const promoted = selectSquare(selected, {row: 0, col: 3});
		expect(promoted.pendingPromotion).not.toBeNull();
		expect(promoted.currentTurn).toBe('white');
	});

	test('completing promotion creates queen', () => {
		let board = emptyBoard(8);
		board = placePiece(board, 1, 3, wPawn);
		board = placePiece(board, 7, 7, wKing);
		board = placePiece(board, 0, 0, bKing);

		const state: GameState = {
			board,
			currentTurn: 'white',
			selectedPosition: null,
			validMoves: [],
			moveHistory: [],
			boardSize: 8,
			gameStatus: 'playing',
			enPassantTarget: null,
			pendingPromotion: null,
		};

		const selected = selectSquare(state, {row: 1, col: 3});
		const promoted = selectSquare(selected, {row: 0, col: 3});
		const completed = completePromotion(promoted, 'queen');
		expect(completed.board[0]![3]?.type).toBe('queen');
		expect(completed.currentTurn).toBe('black');
		expect(completed.pendingPromotion).toBeNull();
	});
});
