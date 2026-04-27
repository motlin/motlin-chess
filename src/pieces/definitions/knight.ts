import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves} from '../moveHelpers.js';

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

export const knightDefinition: PieceDefinition = {
	name: 'Knight',
	symbols: {white: '♘', black: '♞'},
	isStandard: true,
	count: 2,
	royal: false,
	jumper: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getStepMoves(position, board, color, boardSize, KNIGHT_OFFSETS);
	},
};
