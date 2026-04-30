import type {PieceDefinition} from '../PieceDefinition.js';
import {DIAGONAL_DIRECTIONS, getSlidingMoves, getStepMoves} from '../moveHelpers.js';

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

export const archbishopDefinition: PieceDefinition = {
	name: 'Archbishop',
	notation: 'A',
	symbols: {white: 'A', black: 'a'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget, duckPosition) {
		const bishopMoves = getSlidingMoves(position, board, color, boardSize, DIAGONAL_DIRECTIONS, duckPosition);
		const knightMoves = getStepMoves(position, board, color, boardSize, KNIGHT_OFFSETS, duckPosition);
		const seen = new Set(bishopMoves.map((m) => `${m.row},${m.col}`));
		const combined = [...bishopMoves];
		for (const move of knightMoves) {
			const key = `${move.row},${move.col}`;
			if (!seen.has(key)) {
				combined.push(move);
			}
		}
		return combined;
	},
};
