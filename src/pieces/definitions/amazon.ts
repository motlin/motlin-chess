import type {PieceDefinition} from '../PieceDefinition.js';
import {ALL_DIRECTIONS, getSlidingMoves, getStepMoves} from '../moveHelpers.js';

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

export const amazonDefinition: PieceDefinition = {
	name: 'Amazon',
	notation: 'AM',
	symbols: {white: 'M', black: 'm'},
	isStandard: false,
	count: 1,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		const queenMoves = getSlidingMoves(position, board, color, boardSize, ALL_DIRECTIONS);
		const knightMoves = getStepMoves(position, board, color, boardSize, KNIGHT_OFFSETS);
		const seen = new Set(queenMoves.map((m) => `${m.row},${m.col}`));
		const combined = [...queenMoves];
		for (const move of knightMoves) {
			const key = `${move.row},${move.col}`;
			if (!seen.has(key)) {
				combined.push(move);
			}
		}
		return combined;
	},
};
