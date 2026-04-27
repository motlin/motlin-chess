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
	return Math.floor((boardSize - 8) / 2);
}

export function createInitialBoard(boardSize: number, _enabledExtraPieces: ReadonlySet<string>): Board {
	const board: (Piece | null)[][] = Array.from({length: boardSize}, () =>
		Array.from<Piece | null>({length: boardSize}).fill(null),
	);

	const offset = getStandardOffset(boardSize);

	for (let i = 0; i < BACK_RANK_PATTERN.length; i++) {
		const pieceType = BACK_RANK_PATTERN[i];
		if (pieceType === undefined) {
			continue;
		}
		const col = offset + i;
		board[0]![col] = createPiece(pieceType, 'black');
		board[boardSize - 1]![col] = createPiece(pieceType, 'white');
	}

	for (let col = 0; col < boardSize; col++) {
		board[1]![col] = createPiece('pawn', 'black');
		board[boardSize - 2]![col] = createPiece('pawn', 'white');
	}

	return board;
}
