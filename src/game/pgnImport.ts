import type {Board, Color, GameSettings, GameState, Move, Position} from '../types.js';
import {moveToSan} from './notation.js';
import {applyMove, computeEnPassantTarget, getGameStatus, getLegalMoves} from './gameLogic.js';
import {createInitialBoard} from './boardSetup.js';

function stripSuffix(san: string): string {
	return san.replace(/[+#]$/, '');
}

export function parsePgn(pgn: string): {headers: Record<string, string>; moves: string[]} {
	const headers: Record<string, string> = {};
	const lines = pgn.split('\n');

	const movetextLines: string[] = [];
	for (const line of lines) {
		const trimmed = line.trim();
		const headerMatch = trimmed.match(/^\[(\w+)\s+"(.*)"\]$/);
		if (headerMatch) {
			headers[headerMatch[1]!] = headerMatch[2]!;
			continue;
		}
		if (trimmed.length > 0) {
			movetextLines.push(trimmed);
		}
	}

	let movetext = movetextLines.join(' ');

	// Strip curly-brace comments
	movetext = movetext.replace(/\{[^}]*\}/g, '');

	// Strip parenthesized variations (nested)
	let previous = '';
	while (previous !== movetext) {
		previous = movetext;
		movetext = movetext.replace(/\([^()]*\)/g, '');
	}

	// Tokenize
	const tokens = movetext.split(/\s+/).filter((token) => token.length > 0);

	const resultTokens = new Set(['1-0', '0-1', '1/2-1/2', '*']);

	const moves: string[] = [];
	for (const token of tokens) {
		if (resultTokens.has(token)) {
			continue;
		}
		// Skip move numbers like "1." or "1..."
		if (/^\d+\./.test(token)) {
			continue;
		}
		moves.push(token);
	}

	return {headers, moves};
}

export function findMoveForSan(
	san: string,
	board: Board,
	color: Color,
	boardSize: number,
	enPassantTarget: Position | null,
): Move | null {
	const strippedInput = stripSuffix(san);

	for (let row = 0; row < boardSize; row++) {
		for (let col = 0; col < boardSize; col++) {
			const piece = board.get(row, col);
			if (piece === null || piece.color !== color) {
				continue;
			}

			const legalMoves = getLegalMoves(board, {row, col}, boardSize, enPassantTarget);
			for (const move of legalMoves) {
				const moveSan = moveToSan(board, move, boardSize, enPassantTarget, 'playing');
				if (stripSuffix(moveSan) === strippedInput) {
					return move;
				}
			}
		}
	}

	return null;
}

export function importPgn(pgn: string, settings: GameSettings): GameState {
	const {moves: sanMoves} = parsePgn(pgn);

	let board = createInitialBoard(settings.boardSize, settings.enabledPieces);
	let currentTurn: Color = 'white';
	let enPassantTarget: Position | null = null;
	const moveHistory: Move[] = [];

	for (const san of sanMoves) {
		const move = findMoveForSan(san, board, currentTurn, settings.boardSize, enPassantTarget);
		if (move === null) {
			throw new Error(`Invalid or illegal move: ${san}`);
		}

		moveHistory.push(move);

		const piece = board.get(move.from.row, move.from.col);
		board = applyMove(board, move);
		enPassantTarget = piece !== null ? computeEnPassantTarget(move, piece, settings.boardSize) : null;
		currentTurn = currentTurn === 'white' ? 'black' : 'white';
	}

	const gameStatus = getGameStatus(board, currentTurn, settings.boardSize, enPassantTarget);

	return {
		board,
		currentTurn,
		selectedPosition: null,
		validMoves: [],
		moveHistory,
		boardSize: settings.boardSize,
		gameStatus,
		enPassantTarget,
		pendingPromotion: null,
		duckPosition: null,
		turnPhase: 'move',
	};
}
