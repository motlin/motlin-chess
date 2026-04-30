import type {Board, Color, GameSettings, GameStatus, Move, Position} from '../types.js';
import {getPieceDefinition} from '../pieces/registry.js';
import {applyMove, computeEnPassantTarget, getGameStatus, getLegalMoves} from './gameLogic.js';
import {createInitialBoard} from './boardSetup.js';

export function colToFile(col: number): string {
	return String.fromCodePoint('a'.codePointAt(0)! + col);
}

export function rowToRank(row: number, boardSize: number): string {
	return String(boardSize - row);
}

export function positionToSquare(pos: Position, boardSize: number): string {
	return colToFile(pos.col) + rowToRank(pos.row, boardSize);
}

export function moveToSan(
	board: Board,
	move: Move,
	boardSize: number,
	enPassantTarget: Position | null,
	gameStatusAfter: GameStatus,
): string {
	const piece = board.get(move.from.row, move.from.col);
	if (piece === null) {
		return '';
	}

	const definition = getPieceDefinition(piece.type);
	if (definition === undefined) {
		return '';
	}

	if (move.isCastle) {
		const base = move.to.col > move.from.col ? 'O-O' : 'O-O-O';
		return base + suffix(gameStatusAfter);
	}

	const destination = positionToSquare(move.to, boardSize);
	const isCapture = move.captured !== null || move.isEnPassant;

	if (definition.notation === '') {
		let san = '';
		if (isCapture) {
			san = colToFile(move.from.col) + 'x' + destination;
		} else {
			san = destination;
		}
		if (move.promotion !== null) {
			const promoDef = getPieceDefinition(move.promotion);
			san += '=' + (promoDef?.notation ?? '?');
		}
		return san + suffix(gameStatusAfter);
	}

	const disambiguation = getDisambiguation(board, move, piece.color, boardSize, enPassantTarget, definition.notation);
	const capture = isCapture ? 'x' : '';
	return definition.notation + disambiguation + capture + destination + suffix(gameStatusAfter);
}

function suffix(gameStatusAfter: GameStatus): string {
	if (gameStatusAfter === 'checkmate') {
		return '#';
	}
	if (gameStatusAfter === 'check') {
		return '+';
	}
	return '';
}

function getDisambiguation(
	board: Board,
	move: Move,
	color: Color,
	boardSize: number,
	enPassantTarget: Position | null,
	notation: string,
): string {
	const piece = board.get(move.from.row, move.from.col);
	if (piece === null) {
		return '';
	}

	const ambiguous: Position[] = [];

	for (let row = 0; row < boardSize; row++) {
		for (let col = 0; col < boardSize; col++) {
			if (row === move.from.row && col === move.from.col) {
				continue;
			}
			const other = board.get(row, col);
			if (other === null || other.color !== color || other.type !== piece.type) {
				continue;
			}
			const otherDef = getPieceDefinition(other.type);
			if (otherDef === undefined || otherDef.notation !== notation) {
				continue;
			}
			const otherMoves = getLegalMoves(board, {row, col}, boardSize, enPassantTarget);
			if (otherMoves.some((m) => m.to.row === move.to.row && m.to.col === move.to.col)) {
				ambiguous.push({row, col});
			}
		}
	}

	if (ambiguous.length === 0) {
		return '';
	}

	const sameFile = ambiguous.some((p) => p.col === move.from.col);
	const sameRank = ambiguous.some((p) => p.row === move.from.row);

	if (!sameFile) {
		return colToFile(move.from.col);
	}
	if (!sameRank) {
		return rowToRank(move.from.row, boardSize);
	}
	return colToFile(move.from.col) + rowToRank(move.from.row, boardSize);
}

export function generateMoveNotations(
	settings: GameSettings,
	moveHistory: readonly Move[],
	finalGameStatus: GameStatus,
): string[] {
	if (moveHistory.length === 0) {
		return [];
	}

	const sans: string[] = [];
	let board = createInitialBoard(settings.boardSize, settings.enabledPieces);
	let currentTurn: Color = 'white';
	let enPassantTarget: Position | null = null;

	for (let i = 0; i < moveHistory.length; i++) {
		const move = moveHistory[i]!;
		const piece = board.get(move.from.row, move.from.col);

		const newBoard = applyMove(board, move);
		const nextTurn: Color = currentTurn === 'white' ? 'black' : 'white';

		let gameStatusAfter: GameStatus;
		if (i === moveHistory.length - 1) {
			gameStatusAfter = finalGameStatus;
		} else {
			const nextEnPassant = piece !== null ? computeEnPassantTarget(move, piece, settings.boardSize) : null;
			gameStatusAfter = getGameStatus(newBoard, nextTurn, settings.boardSize, nextEnPassant);
		}

		sans.push(moveToSan(board, move, settings.boardSize, enPassantTarget, gameStatusAfter));

		if (piece !== null) {
			enPassantTarget = computeEnPassantTarget(move, piece, settings.boardSize);
		} else {
			enPassantTarget = null;
		}

		board = newBoard;
		currentTurn = nextTurn;
	}

	return sans;
}

export function formatMovetext(sans: readonly string[]): string {
	if (sans.length === 0) {
		return '';
	}

	const parts: string[] = [];
	for (let i = 0; i < sans.length; i += 2) {
		const moveNumber = Math.floor(i / 2) + 1;
		const white = sans[i]!;
		const black = sans[i + 1];
		if (black !== undefined) {
			parts.push(`${moveNumber}. ${white} ${black}`);
		} else {
			parts.push(`${moveNumber}. ${white}`);
		}
	}
	return parts.join(' ');
}

function pgnResult(finalGameStatus: GameStatus, moveCount: number): string {
	if (finalGameStatus === 'checkmate') {
		const lastMoveByWhite = moveCount % 2 === 1;
		return lastMoveByWhite ? '1-0' : '0-1';
	}
	if (finalGameStatus === 'stalemate') {
		return '1/2-1/2';
	}
	return '*';
}

export function formatPgn(settings: GameSettings, moveHistory: readonly Move[], finalGameStatus: GameStatus): string {
	const sans = generateMoveNotations(settings, moveHistory, finalGameStatus);
	const result = pgnResult(finalGameStatus, moveHistory.length);
	const today = new Date();
	const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

	const headers = [
		`[Event "Casual Game"]`,
		`[Site "motlin-chess"]`,
		`[Date "${dateStr}"]`,
		`[Round "-"]`,
		`[White "White"]`,
		`[Black "Black"]`,
		`[Result "${result}"]`,
	];

	const movetext = formatMovetext(sans);
	const body = movetext.length > 0 ? `${movetext} ${result}` : result;

	return headers.join('\n') + '\n\n' + body + '\n';
}
