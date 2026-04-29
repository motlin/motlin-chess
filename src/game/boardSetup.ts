import type {Color, Piece, PieceType} from '../types.js';
import {Board} from '../types.js';

function createPiece(type: PieceType, color: Color): Piece {
	return {type, color, hasMoved: false};
}

export function getStandardOffset(boardSize: number): number {
	if (boardSize < 8) {
		return 0;
	}
	return Math.floor((boardSize - 8) / 2);
}

function buildFullBackRank(enabledPieces: ReadonlySet<string>): readonly PieceType[] {
	const has = (type: string): boolean => enabledPieces.has(type);

	const royalPiece: PieceType = has('centaur') ? 'centaur' : 'king';

	const pairedPieces: PieceType[] = [
		'bishop',
		'archbishop',
		'elephant',
		'knight',
		'camel',
		'wizard',
		'chancellor',
		'zebra',
		'mann',
		'champion',
		'dragon',
	];

	const rightHalf: PieceType[] = [royalPiece];
	for (const piece of pairedPieces) {
		if (has(piece)) {
			rightHalf.push(piece);
		}
	}
	if (has('rook')) {
		rightHalf.push('rook');
	}

	const leftHalf = [...rightHalf].reverse();
	leftHalf.pop();

	const singlePieces: PieceType[] = ['queen', 'amazon'];
	const fullRank: PieceType[] = [...leftHalf];
	for (const piece of singlePieces) {
		if (has(piece)) {
			fullRank.push(piece);
		}
	}
	fullRank.push(...rightHalf);

	return fullRank;
}

const REMOVAL_ORDER: readonly string[] = [
	'camel',
	'knight',
	'wizard',
	'zebra',
	'mann',
	'champion',
	'dragon',
	'elephant',
	'chancellor',
	'archbishop',
	'amazon',
	'queen',
	'bishop',
	'rook',
];

function trimToFit(rank: readonly PieceType[], boardSize: number): readonly PieceType[] {
	if (rank.length <= boardSize) {
		return rank;
	}

	const result = [...rank];

	for (const pieceToRemove of REMOVAL_ORDER) {
		if (result.length <= boardSize) {
			break;
		}

		let rightIdx = result.lastIndexOf(pieceToRemove);
		while (rightIdx !== -1 && result.length > boardSize) {
			result.splice(rightIdx, 1);
			rightIdx = result.lastIndexOf(pieceToRemove);
		}
	}

	return result;
}

export function buildBackRank(enabledPieces: ReadonlySet<string>, boardSize?: number): readonly PieceType[] {
	const full = buildFullBackRank(enabledPieces);
	if (boardSize !== undefined) {
		return trimToFit(full, boardSize);
	}
	return full;
}

export function createInitialBoard(boardSize: number, enabledPieces: ReadonlySet<string>): Board {
	let board = Board.empty(boardSize);

	const backRank = buildBackRank(enabledPieces, boardSize);
	const offset = Math.floor((boardSize - backRank.length) / 2);

	for (const [i, pieceType] of backRank.entries()) {
		const col = offset + i;
		if (col >= 0 && col < boardSize) {
			board = board.withPiece(0, col, createPiece(pieceType, 'black'));
			board = board.withPiece(boardSize - 1, col, createPiece(pieceType, 'white'));
		}
	}

	if (boardSize >= 4) {
		for (let col = 0; col < boardSize; col++) {
			board = board.withPiece(1, col, createPiece('pawn', 'black'));
			board = board.withPiece(boardSize - 2, col, createPiece('pawn', 'white'));
		}
	}

	return board;
}
