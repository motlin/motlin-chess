import type {PieceDefinition} from '../PieceDefinition.js';
import {CARDINAL_DIRECTIONS, getSlidingMoves, getStepMoves} from '../moveHelpers.js';

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

export const chancellorDefinition: PieceDefinition = {
	name: 'Chancellor',
	symbols: {white: 'C', black: 'c'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		const rookMoves = getSlidingMoves(position, board, color, boardSize, CARDINAL_DIRECTIONS);
		const knightMoves = getStepMoves(position, board, color, boardSize, KNIGHT_OFFSETS);
		const seen = new Set(rookMoves.map((m) => `${m.row},${m.col}`));
		const combined = [...rookMoves];
		for (const move of knightMoves) {
			const key = `${move.row},${move.col}`;
			if (!seen.has(key)) {
				combined.push(move);
			}
		}
		return combined;
	},
};
