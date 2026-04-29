import type {Board, Color, Piece, PieceType} from '../types.js';

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

	const rightHalf: PieceType[] = [royalPiece];
	if (has('bishop')) {
		rightHalf.push('bishop');
	}
	if (has('archbishop')) {
		rightHalf.push('archbishop');
	}
	if (has('knight')) {
		rightHalf.push('knight');
	}
	if (has('chancellor')) {
		rightHalf.push('chancellor');
	}
	if (has('rook')) {
		rightHalf.push('rook');
	}

	const leftHalf = [...rightHalf].reverse();
	leftHalf.pop();

	const fullRank: PieceType[] = [...leftHalf];
	if (has('queen')) {
		fullRank.push('queen');
	}
	fullRank.push(...rightHalf);

	return fullRank;
}

const REMOVAL_ORDER: readonly string[] = ['knight', 'chancellor', 'archbishop', 'queen', 'bishop', 'rook'];

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
	const board: (Piece | null)[][] = Array.from({length: boardSize}, () =>
		Array.from<Piece | null>({length: boardSize}).fill(null),
	);

	const backRank = buildBackRank(enabledPieces, boardSize);
	const offset = Math.floor((boardSize - backRank.length) / 2);

	for (const [i, pieceType] of backRank.entries()) {
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
