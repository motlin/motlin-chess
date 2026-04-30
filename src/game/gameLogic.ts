import type {Color, GameSettings, GameState, GameStatus, Move, Piece, PieceType, Position} from '../types.js';
import {Board} from '../types.js';
import {getPieceDefinition} from '../pieces/registry.js';
import {createInitialBoard, getStandardOffset} from './boardSetup.js';

export function createInitialGameState(settings: GameSettings): GameState {
	return {
		board: createInitialBoard(settings.boardSize, settings.enabledPieces),
		currentTurn: 'white',
		selectedPosition: null,
		validMoves: [],
		moveHistory: [],
		boardSize: settings.boardSize,
		gameStatus: 'playing',
		enPassantTarget: null,
		pendingPromotion: null,
		duckPosition: null,
		turnPhase: 'move',
	};
}

export function applyMove(board: Board, move: Move): Board {
	const grid = board.toMutableGrid();
	const piece = board.get(move.from.row, move.from.col);
	if (piece === null) {
		return new Board(grid);
	}

	const movedPiece: Piece = {
		...piece,
		hasMoved: true,
		type: move.promotion ?? piece.type,
	};

	grid[move.from.row]![move.from.col] = null;
	grid[move.to.row]![move.to.col] = movedPiece;

	if (move.isEnPassant) {
		grid[move.from.row]![move.to.col] = null;
	}

	if (move.isCastle) {
		const direction = move.to.col > move.from.col ? 1 : -1;
		const rookFromCol =
			direction === 1
				? findRookCol(board, move.from.row, move.from.col, 1)
				: findRookCol(board, move.from.row, move.from.col, -1);
		if (rookFromCol !== null) {
			const rookToCol = move.from.col + direction;
			const rook = board.get(move.from.row, rookFromCol);
			if (rook !== null) {
				grid[move.from.row]![rookFromCol] = null;
				grid[move.from.row]![rookToCol] = {...rook, hasMoved: true};
			}
		}
	}

	return new Board(grid);
}

function findRookCol(board: Board, row: number, kingCol: number, direction: number): number | null {
	let col = kingCol + direction;
	while (col >= 0 && col < board.size) {
		const piece = board.get(row, col);
		if (piece !== null) {
			if (piece.type === 'rook' && !piece.hasMoved) {
				return col;
			}
			return null;
		}
		col += direction;
	}
	return null;
}

function isRoyal(type: string): boolean {
	const def = getPieceDefinition(type);
	return def?.royal === true;
}

function findKing(board: Board, color: Color): Position | null {
	for (let row = 0; row < board.size; row++) {
		for (let col = 0; col < board.size; col++) {
			const piece = board.get(row, col);
			if (piece !== null && isRoyal(piece.type) && piece.color === color) {
				return {row, col};
			}
		}
	}
	return null;
}

function isSquareAttackedBy(
	board: Board,
	position: Position,
	attackerColor: Color,
	duckPosition?: Position | null,
): boolean {
	for (let row = 0; row < board.size; row++) {
		for (let col = 0; col < board.size; col++) {
			const piece = board.get(row, col);
			if (piece === null || piece.color !== attackerColor) {
				continue;
			}
			const definition = getPieceDefinition(piece.type);
			if (definition === undefined) {
				continue;
			}
			const moves = definition.getValidMoves({row, col}, board, piece.color, board.size, null, duckPosition);
			if (moves.some((m) => m.row === position.row && m.col === position.col)) {
				return true;
			}
		}
	}
	return false;
}

export function isInCheck(board: Board, color: Color, _boardSize?: number): boolean {
	const kingPos = findKing(board, color);
	if (kingPos === null) {
		return false;
	}
	const opponentColor: Color = color === 'white' ? 'black' : 'white';
	return isSquareAttackedBy(board, kingPos, opponentColor);
}

function getRawMovesForPiece(
	board: Board,
	position: Position,
	enPassantTarget: Position | null,
	duckPosition?: Position | null,
): Move[] {
	const piece = board.get(position.row, position.col);
	if (piece === null) {
		return [];
	}

	const definition = getPieceDefinition(piece.type);
	if (definition === undefined) {
		return [];
	}

	const targetPositions = definition.getValidMoves(
		position,
		board,
		piece.color,
		board.size,
		enPassantTarget,
		duckPosition,
	);
	const promotionRow = piece.color === 'white' ? 0 : board.size - 1;

	const moves: Move[] = [];
	for (const to of targetPositions) {
		const captured = board.get(to.row, to.col);
		const isEnPassant = piece.type === 'pawn' && to.col !== position.col && captured === null;
		const isPromotion = piece.type === 'pawn' && to.row === promotionRow;
		const capturedPiece = isEnPassant ? board.get(position.row, to.col) : captured;

		if (isPromotion) {
			const promotionTypes: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];
			for (const promotion of promotionTypes) {
				moves.push({
					from: position,
					to,
					captured: capturedPiece,
					isEnPassant,
					isCastle: false,
					promotion,
				});
			}
		} else {
			moves.push({
				from: position,
				to,
				captured: capturedPiece,
				isEnPassant,
				isCastle: false,
				promotion: null,
			});
		}
	}

	return moves;
}

function getCastlingMoves(
	board: Board,
	position: Position,
	duckChess?: boolean,
	duckPosition?: Position | null,
): Move[] {
	const piece = board.get(position.row, position.col);
	if (piece === null || !isRoyal(piece.type) || piece.hasMoved) {
		return [];
	}

	const opponentColor: Color = piece.color === 'white' ? 'black' : 'white';
	if (!duckChess && isSquareAttackedBy(board, position, opponentColor)) {
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
		if (kingToCol < 0 || kingToCol >= board.size) {
			continue;
		}
		let pathClear = true;
		const minCol = Math.min(position.col, rookCol);
		const maxCol = Math.max(position.col, rookCol);
		for (let col = minCol + 1; col < maxCol; col++) {
			if (board.get(row, col) !== null) {
				pathClear = false;
				break;
			}
			if (duckPosition && duckPosition.row === row && duckPosition.col === col) {
				pathClear = false;
				break;
			}
		}
		if (!pathClear) {
			continue;
		}

		if (!duckChess) {
			let passesThroughCheck = false;
			const step = direction;
			for (let col = position.col + step; col !== kingToCol + step; col += step) {
				if (isSquareAttackedBy(board, {row, col}, opponentColor)) {
					passesThroughCheck = true;
					break;
				}
			}
			if (passesThroughCheck) {
				continue;
			}
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
	_boardSize: number,
	enPassantTarget: Position | null,
	duckChess?: boolean,
	duckPosition?: Position | null,
): Move[] {
	const piece = board.get(position.row, position.col);
	if (piece === null) {
		return [];
	}

	const rawMoves = getRawMovesForPiece(board, position, enPassantTarget, duckPosition);

	if (isRoyal(piece.type)) {
		rawMoves.push(...getCastlingMoves(board, position, duckChess, duckPosition));
	}

	if (duckChess) {
		return rawMoves;
	}

	return rawMoves.filter((move) => {
		const newBoard = applyMove(board, move);
		return !isInCheck(newBoard, piece.color, board.size);
	});
}

function hasAnyLegalMoves(
	board: Board,
	color: Color,
	enPassantTarget: Position | null,
	duckChess?: boolean,
	duckPosition?: Position | null,
): boolean {
	for (let row = 0; row < board.size; row++) {
		for (let col = 0; col < board.size; col++) {
			const piece = board.get(row, col);
			if (piece === null || piece.color !== color) {
				continue;
			}
			const moves = getLegalMoves(board, {row, col}, board.size, enPassantTarget, duckChess, duckPosition);
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
	duckChess?: boolean,
	duckPosition?: Position | null,
): GameStatus {
	if (duckChess) {
		if (findKing(board, 'white') === null || findKing(board, 'black') === null) {
			return 'kingCaptured';
		}
		if (!hasAnyLegalMoves(board, currentTurn, enPassantTarget, true, duckPosition)) {
			return 'fowled';
		}
		return 'playing';
	}

	const inCheck = isInCheck(board, currentTurn, boardSize);
	const hasLegal = hasAnyLegalMoves(board, currentTurn, enPassantTarget);

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

export function selectSquare(state: GameState, position: Position, duckChess?: boolean): GameState {
	if (
		state.gameStatus === 'checkmate' ||
		state.gameStatus === 'stalemate' ||
		state.gameStatus === 'kingCaptured' ||
		state.gameStatus === 'fowled'
	) {
		return state;
	}

	if (duckChess && state.turnPhase === 'placeDuck') {
		return placeDuck(state, position);
	}

	if (state.pendingPromotion !== null) {
		return state;
	}

	const clickedPiece = state.board.get(position.row, position.col);

	if (state.selectedPosition !== null) {
		if (state.selectedPosition.row === position.row && state.selectedPosition.col === position.col) {
			return {...state, selectedPosition: null, validMoves: []};
		}

		const selectedMove = state.validMoves.find((m) => m.to.row === position.row && m.to.col === position.col);

		if (selectedMove !== undefined) {
			const selectedPiece = state.board.get(state.selectedPosition.row, state.selectedPosition.col);
			if (selectedPiece === null) {
				return {...state, selectedPosition: null, validMoves: []};
			}

			const promotionRow = state.currentTurn === 'white' ? 0 : state.boardSize - 1;
			if (selectedPiece.type === 'pawn' && position.row === promotionRow) {
				return {
					...state,
					pendingPromotion: selectedMove,
				};
			}

			return executeMove(state, selectedMove, selectedPiece, duckChess);
		}

		if (clickedPiece !== null && clickedPiece.color === state.currentTurn) {
			const moves = getLegalMoves(
				state.board,
				position,
				state.boardSize,
				state.enPassantTarget,
				duckChess,
				state.duckPosition,
			);
			return {...state, selectedPosition: position, validMoves: moves};
		}

		return {...state, selectedPosition: null, validMoves: []};
	}

	if (clickedPiece !== null && clickedPiece.color === state.currentTurn) {
		const moves = getLegalMoves(
			state.board,
			position,
			state.boardSize,
			state.enPassantTarget,
			duckChess,
			state.duckPosition,
		);
		return {...state, selectedPosition: position, validMoves: moves};
	}

	return state;
}

function placeDuck(state: GameState, position: Position): GameState {
	const target = state.board.get(position.row, position.col);
	if (target !== null) return state;
	if (state.duckPosition && position.row === state.duckPosition.row && position.col === state.duckPosition.col) {
		return state;
	}

	const nextTurn: Color = state.currentTurn === 'white' ? 'black' : 'white';
	const gameStatus = getGameStatus(state.board, nextTurn, state.boardSize, state.enPassantTarget, true, position);

	return {
		...state,
		duckPosition: position,
		currentTurn: nextTurn,
		turnPhase: 'move',
		gameStatus,
		selectedPosition: null,
		validMoves: [],
	};
}

export function completePromotion(state: GameState, promotionType: PieceType, duckChess?: boolean): GameState {
	if (state.pendingPromotion === null) {
		return state;
	}

	const move: Move = {...state.pendingPromotion, promotion: promotionType};
	const piece = state.board.get(move.from.row, move.from.col);
	if (piece === null) {
		return {...state, pendingPromotion: null, selectedPosition: null, validMoves: []};
	}

	return executeMove({...state, pendingPromotion: null}, move, piece, duckChess);
}

function executeMove(state: GameState, move: Move, piece: Piece, duckChess?: boolean): GameState {
	const newBoard = applyMove(state.board, move);
	const enPassantTarget = computeEnPassantTarget(move, piece, state.boardSize);

	if (duckChess) {
		const kingCaptured = move.captured !== null && isRoyal(move.captured.type);

		if (kingCaptured) {
			return {
				board: newBoard,
				currentTurn: state.currentTurn,
				selectedPosition: null,
				validMoves: [],
				moveHistory: [...state.moveHistory, move],
				boardSize: state.boardSize,
				gameStatus: 'kingCaptured',
				enPassantTarget,
				pendingPromotion: null,
				duckPosition: state.duckPosition,
				turnPhase: 'move',
			};
		}

		return {
			board: newBoard,
			currentTurn: state.currentTurn,
			selectedPosition: null,
			validMoves: [],
			moveHistory: [...state.moveHistory, move],
			boardSize: state.boardSize,
			gameStatus: 'playing',
			enPassantTarget,
			pendingPromotion: null,
			duckPosition: state.duckPosition,
			turnPhase: 'placeDuck',
		};
	}

	const nextTurn: Color = state.currentTurn === 'white' ? 'black' : 'white';
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
		duckPosition: state.duckPosition,
		turnPhase: 'move',
	};
}

export function getKingColumn(boardSize: number): number {
	return getStandardOffset(boardSize) + 4;
}
