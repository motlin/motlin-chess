import type {Board, Color, Piece, PieceType} from '../types.js';

const BACK_RANK_PATTERN: readonly PieceType[] = [
	'rook',
	'knight',
	'bishop',
	'queen',
	'king',
	'bishop',
	'knight',
	'rook',
];

function createPiece(type: PieceType, color: Color): Piece {
	return {type, color, hasMoved: false};
}

export function getStandardOffset(boardSize: number): number {
	if (boardSize < 8) {
		return 0;
	}
	return Math.floor((boardSize - 8) / 2);
}

function getBackRankForSize(boardSize: number): readonly PieceType[] {
	if (boardSize >= 8) {
		return BACK_RANK_PATTERN;
	}
	const pieces: PieceType[] = ['king'];
	const available: PieceType[] = ['queen', 'rook', 'rook', 'bishop', 'bishop', 'knight', 'knight'];
	for (const piece of available) {
		if (pieces.length >= boardSize) {
			break;
		}
		pieces.push(piece);
	}
	pieces.sort((a, b) => {
		const order: Record<string, number> = {rook: 0, knight: 1, bishop: 2, queen: 3, king: 4};
		return (order[a] ?? 5) - (order[b] ?? 5);
	});
	return pieces;
}

function insertBetween(
	base: PieceType[],
	pieceType: PieceType,
	leftNeighbor: PieceType,
	rightNeighbor: PieceType,
	boardSize: number,
): void {
	if (base.length + 2 > boardSize) {
		return;
	}

	const leftIdx = base.indexOf(leftNeighbor);
	const rightIdx = leftIdx !== -1 ? base.indexOf(rightNeighbor, leftIdx + 1) : -1;
	if (leftIdx !== -1 && rightIdx !== -1 && rightIdx === leftIdx + 1) {
		base.splice(rightIdx, 0, pieceType);
	}

	const lastRight = base.lastIndexOf(rightNeighbor);
	const lastLeft = lastRight !== -1 ? base.lastIndexOf(leftNeighbor, lastRight - 1) : -1;
	if (lastRight !== -1 && lastLeft !== -1 && lastLeft === lastRight - 1) {
		base.splice(lastRight, 0, pieceType);
	}
}

export function buildBackRank(boardSize: number, enabledExtraPieces: ReadonlySet<string>): readonly PieceType[] {
	const base = [...getBackRankForSize(boardSize)];

	if (enabledExtraPieces.has('centaur')) {
		for (let i = 0; i < base.length; i++) {
			if (base[i] === 'king') {
				base[i] = 'centaur';
			}
		}
	}

	if (enabledExtraPieces.has('chancellor')) {
		insertBetween(base, 'chancellor', 'rook', 'knight', boardSize);
	}

	if (enabledExtraPieces.has('archbishop')) {
		insertBetween(base, 'archbishop', 'knight', 'bishop', boardSize);
	}

	return base;
}

export function createInitialBoard(boardSize: number, enabledExtraPieces: ReadonlySet<string>): Board {
	const board: (Piece | null)[][] = Array.from({length: boardSize}, () =>
		Array.from<Piece | null>({length: boardSize}).fill(null),
	);

	const backRank = buildBackRank(boardSize, enabledExtraPieces);
	const offset = Math.floor((boardSize - backRank.length) / 2);

	for (let i = 0; i < backRank.length; i++) {
		const pieceType = backRank[i];
		if (pieceType === undefined) {
			continue;
		}
		const col = offset + i;
		if (col >= 0 && col < boardSize) {
			board[0]![col] = createPiece(pieceType, 'black');
			board[boardSize - 1]![col] = createPiece(pieceType, 'white');
		}
	}

	if (boardSize >= 4) {
		for (let col = 0; col < boardSize; col++) {
			board[1]![col] = createPiece('pawn', 'black');
			board[boardSize - 2]![col] = createPiece('pawn', 'white');
		}
	}

	return board;
}
