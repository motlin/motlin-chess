import type {Board, Color, GameSettings, GameState, GameStatus, Move, Piece, PieceType, Position} from '../types.js';
import {getPieceDefinition} from '../pieces/registry.js';
import {createInitialBoard, getStandardOffset} from './boardSetup.js';

export function createInitialGameState(settings: GameSettings): GameState {
	return {
		board: createInitialBoard(settings.boardSize, settings.enabledExtraPieces),
		currentTurn: 'white',
		selectedPosition: null,
		validMoves: [],
		moveHistory: [],
		boardSize: settings.boardSize,
		gameStatus: 'playing',
		enPassantTarget: null,
		pendingPromotion: null,
	};
}

function cloneBoard(board: Board): (Piece | null)[][] {
	return board.map((row) => [...row]);
}

export function applyMove(board: Board, move: Move): (Piece | null)[][] {
	const newBoard = cloneBoard(board);
	const piece = board[move.from.row]?.[move.from.col];
	if (piece === null || piece === undefined) {
		return newBoard;
	}

	const movedPiece: Piece = {
		...piece,
		hasMoved: true,
		type: move.promotion ?? piece.type,
	};

	newBoard[move.from.row]![move.from.col] = null;
	newBoard[move.to.row]![move.to.col] = movedPiece;

	if (move.isEnPassant) {
		newBoard[move.from.row]![move.to.col] = null;
	}

	if (move.isCastle) {
		const direction = move.to.col > move.from.col ? 1 : -1;
		const rookFromCol =
			direction === 1
				? findRookCol(board, move.from.row, move.from.col, 1)
				: findRookCol(board, move.from.row, move.from.col, -1);
		if (rookFromCol !== null) {
			const rookToCol = move.from.col + direction;
			const rook = board[move.from.row]?.[rookFromCol];
			if (rook !== null && rook !== undefined) {
				newBoard[move.from.row]![rookFromCol] = null;
				newBoard[move.from.row]![rookToCol] = {...rook, hasMoved: true};
			}
		}
	}

	return newBoard;
}

function findRookCol(board: Board, row: number, kingCol: number, direction: number): number | null {
	let col = kingCol + direction;
	const boardSize = board[0]?.length ?? 0;
	while (col >= 0 && col < boardSize) {
		const piece = board[row]?.[col];
		if (piece !== null && piece !== undefined) {
			if (piece.type === 'rook' && !piece.hasMoved) {
				return col;
			}
			return null;
		}
		col += direction;
	}
	return null;
}

function findKing(board: Board, color: Color, boardSize: number): Position | null {
	for (let row = 0; row < boardSize; row++) {
		for (let col = 0; col < boardSize; col++) {
			const piece = board[row]?.[col];
			if (
				piece !== null &&
				piece !== undefined &&
				(piece.type === 'king' || piece.type === 'centaur') &&
				piece.color === color
			) {
				return {row, col};
			}
		}
	}
	return null;
}

function isSquareAttackedBy(board: Board, position: Position, attackerColor: Color, boardSize: number): boolean {
	for (let row = 0; row < boardSize; row++) {
		for (let col = 0; col < boardSize; col++) {
			const piece = board[row]?.[col];
			if (piece === null || piece === undefined || piece.color !== attackerColor) {
				continue;
			}
			const definition = getPieceDefinition(piece.type);
			if (definition === undefined) {
				continue;
			}
			const moves = definition.getValidMoves({row, col}, board, piece.color, boardSize, null);
			if (moves.some((m) => m.row === position.row && m.col === position.col)) {
				return true;
			}
		}
	}
	return false;
}

export function isInCheck(board: Board, color: Color, boardSize: number): boolean {
	const kingPos = findKing(board, color, boardSize);
	if (kingPos === null) {
		return false;
	}
	const opponentColor: Color = color === 'white' ? 'black' : 'white';
	return isSquareAttackedBy(board, kingPos, opponentColor, boardSize);
}

function getRawMovesForPiece(
	board: Board,
	position: Position,
	boardSize: number,
	enPassantTarget: Position | null,
): Move[] {
	const piece = board[position.row]?.[position.col];
	if (piece === null || piece === undefined) {
		return [];
	}

	const definition = getPieceDefinition(piece.type);
	if (definition === undefined) {
		return [];
	}

	const targetPositions = definition.getValidMoves(position, board, piece.color, boardSize, enPassantTarget);
	const promotionRow = piece.color === 'white' ? 0 : boardSize - 1;

	const moves: Move[] = [];
	for (const to of targetPositions) {
		const captured = board[to.row]?.[to.col] ?? null;
		const isEnPassant = piece.type === 'pawn' && to.col !== position.col && captured === null;
		const isPromotion = piece.type === 'pawn' && to.row === promotionRow;

		if (isPromotion) {
			const promotionTypes: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];
			for (const promotion of promotionTypes) {
				moves.push({
					from: position,
					to,
					captured: isEnPassant ? (board[position.row]?.[to.col] ?? null) : captured,
					isEnPassant,
					isCastle: false,
					promotion,
				});
			}
		} else {
			moves.push({
				from: position,
				to,
				captured: isEnPassant ? (board[position.row]?.[to.col] ?? null) : captured,
				isEnPassant,
				isCastle: false,
				promotion: null,
			});
		}
	}

	return moves;
}

function getCastlingMoves(board: Board, position: Position, boardSize: number): Move[] {
	const piece = board[position.row]?.[position.col];
	if (
		piece === null ||
		piece === undefined ||
		(piece.type !== 'king' && piece.type !== 'centaur') ||
		piece.hasMoved
	) {
		return [];
	}

	const opponentColor: Color = piece.color === 'white' ? 'black' : 'white';
	if (isSquareAttackedBy(board, position, opponentColor, boardSize)) {
		return [];
	}

	const moves: Move[] = [];
	const row = position.row;

	for (const direction of [-1, 1] as const) {
		const rookCol = findRookCol(board, row, position.col, direction);
		if (rookCol === null) {
			continue;
		}

		const kingToCol = position.col + direction * 2;
		let pathClear = true;
		const minCol = Math.min(position.col, rookCol);
		const maxCol = Math.max(position.col, rookCol);
		for (let col = minCol + 1; col < maxCol; col++) {
			if (board[row]?.[col] !== null) {
				pathClear = false;
				break;
			}
		}
		if (!pathClear) {
			continue;
		}

		let passesThroughCheck = false;
		const step = direction;
		for (let col = position.col + step; col !== kingToCol + step; col += step) {
			if (isSquareAttackedBy(board, {row, col}, opponentColor, boardSize)) {
				passesThroughCheck = true;
				break;
			}
		}
		if (passesThroughCheck) {
			continue;
		}

		moves.push({
			from: position,
			to: {row, col: kingToCol},
			captured: null,
			isEnPassant: false,
			isCastle: true,
			promotion: null,
		});
	}

	return moves;
}

export function getLegalMoves(
	board: Board,
	position: Position,
	boardSize: number,
	enPassantTarget: Position | null,
): Move[] {
	const piece = board[position.row]?.[position.col];
	if (piece === null || piece === undefined) {
		return [];
	}

	const rawMoves = getRawMovesForPiece(board, position, boardSize, enPassantTarget);

	if (piece.type === 'king' || piece.type === 'centaur') {
		rawMoves.push(...getCastlingMoves(board, position, boardSize));
	}

	return rawMoves.filter((move) => {
		const newBoard = applyMove(board, move);
		return !isInCheck(newBoard, piece.color, boardSize);
	});
}

function hasAnyLegalMoves(board: Board, color: Color, boardSize: number, enPassantTarget: Position | null): boolean {
	for (let row = 0; row < boardSize; row++) {
		for (let col = 0; col < boardSize; col++) {
			const piece = board[row]?.[col];
			if (piece === null || piece === undefined || piece.color !== color) {
				continue;
			}
			const moves = getLegalMoves(board, {row, col}, boardSize, enPassantTarget);
			if (moves.length > 0) {
				return true;
			}
		}
	}
	return false;
}

export function getGameStatus(
	board: Board,
	currentTurn: Color,
	boardSize: number,
	enPassantTarget: Position | null,
): GameStatus {
	const inCheck = isInCheck(board, currentTurn, boardSize);
	const hasLegal = hasAnyLegalMoves(board, currentTurn, boardSize, enPassantTarget);

	if (!hasLegal) {
		return inCheck ? 'checkmate' : 'stalemate';
	}
	return inCheck ? 'check' : 'playing';
}

function computeEnPassantTarget(move: Move, piece: Piece, boardSize: number): Position | null {
	if (piece.type !== 'pawn') {
		return null;
	}
	const rowDiff = Math.abs(move.to.row - move.from.row);
	if (rowDiff !== 2) {
		return null;
	}
	const behindRow = move.from.row + (piece.color === 'white' ? -1 : 1);
	if (behindRow < 0 || behindRow >= boardSize) {
		return null;
	}
	return {row: behindRow, col: move.from.col};
}

export function selectSquare(state: GameState, position: Position): GameState {
	if (state.pendingPromotion !== null) {
		return state;
	}

	if (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate') {
		return state;
	}

	const clickedPiece = state.board[position.row]?.[position.col] ?? null;

	if (state.selectedPosition !== null) {
		if (state.selectedPosition.row === position.row && state.selectedPosition.col === position.col) {
			return {...state, selectedPosition: null, validMoves: []};
		}

		const selectedMove = state.validMoves.find((m) => m.to.row === position.row && m.to.col === position.col);

		if (selectedMove !== undefined) {
			const selectedPiece = state.board[state.selectedPosition.row]?.[state.selectedPosition.col];
			if (selectedPiece === null || selectedPiece === undefined) {
				return {...state, selectedPosition: null, validMoves: []};
			}

			const promotionRow = state.currentTurn === 'white' ? 0 : state.boardSize - 1;
			if (selectedPiece.type === 'pawn' && position.row === promotionRow) {
				return {
					...state,
					pendingPromotion: selectedMove,
				};
			}

			return executeMove(state, selectedMove, selectedPiece);
		}

		if (clickedPiece !== null && clickedPiece.color === state.currentTurn) {
			const moves = getLegalMoves(state.board, position, state.boardSize, state.enPassantTarget);
			return {...state, selectedPosition: position, validMoves: moves};
		}

		return {...state, selectedPosition: null, validMoves: []};
	}

	if (clickedPiece !== null && clickedPiece.color === state.currentTurn) {
		const moves = getLegalMoves(state.board, position, state.boardSize, state.enPassantTarget);
		return {...state, selectedPosition: position, validMoves: moves};
	}

	return state;
}

export function completePromotion(state: GameState, promotionType: PieceType): GameState {
	if (state.pendingPromotion === null) {
		return state;
	}

	const move: Move = {...state.pendingPromotion, promotion: promotionType};
	const piece = state.board[move.from.row]?.[move.from.col];
	if (piece === null || piece === undefined) {
		return {...state, pendingPromotion: null, selectedPosition: null, validMoves: []};
	}

	return executeMove({...state, pendingPromotion: null}, move, piece);
}

function executeMove(state: GameState, move: Move, piece: Piece): GameState {
	const newBoard = applyMove(state.board, move);
	const nextTurn: Color = state.currentTurn === 'white' ? 'black' : 'white';
	const enPassantTarget = computeEnPassantTarget(move, piece, state.boardSize);
	const gameStatus = getGameStatus(newBoard, nextTurn, state.boardSize, enPassantTarget);

	return {
		board: newBoard,
		currentTurn: nextTurn,
		selectedPosition: null,
		validMoves: [],
		moveHistory: [...state.moveHistory, move],
		boardSize: state.boardSize,
		gameStatus,
		enPassantTarget,
		pendingPromotion: null,
	};
}

export function getKingColumn(boardSize: number): number {
	return getStandardOffset(boardSize) + 4;
}
