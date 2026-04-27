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

export function createInitialBoard(boardSize: number, _enabledExtraPieces: ReadonlySet<string>): Board {
	const board: (Piece | null)[][] = Array.from({length: boardSize}, () =>
		Array.from<Piece | null>({length: boardSize}).fill(null),
	);

	const backRank = getBackRankForSize(boardSize);
	const offset = getStandardOffset(boardSize);

	for (let i = 0; i < backRank.length; i++) {
		const pieceType = backRank[i];
		if (pieceType === undefined) {
			continue;
		}
		const col = offset + i;
		if (col < boardSize) {
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
