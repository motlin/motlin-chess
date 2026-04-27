import type {PieceDefinition} from '../PieceDefinition.js';
import {ALL_DIRECTIONS, getStepMoves} from '../moveHelpers.js';

const KING_OFFSETS = ALL_DIRECTIONS.map((d) => [d.dRow, d.dCol] as const);

const KNIGHT_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-2, -1],
	[-2, 1],
	[-1, -2],
	[-1, 2],
	[1, -2],
	[1, 2],
	[2, -1],
	[2, 1],
];

export const centaurDefinition: PieceDefinition = {
	name: 'Centaur',
	symbols: {white: 'U', black: 'u'},
	isStandard: false,
	count: 1,
	royal: true,
	jumper: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		const kingMoves = getStepMoves(position, board, color, boardSize, KING_OFFSETS);
		const knightMoves = getStepMoves(position, board, color, boardSize, KNIGHT_OFFSETS);
		const seen = new Set(kingMoves.map((m) => `${m.row},${m.col}`));
		const combined = [...kingMoves];
		for (const move of knightMoves) {
			const key = `${move.row},${move.col}`;
			if (!seen.has(key)) {
				combined.push(move);
			}
		}
		return combined;
	},
};
