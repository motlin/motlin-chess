import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves} from '../moveHelpers.js';

const CHAMPION_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1],
	[-2, 0],
	[2, 0],
	[0, -2],
	[0, 2],
	[-2, -2],
	[-2, 2],
	[2, -2],
	[2, 2],
];

export const championDefinition: PieceDefinition = {
	name: 'Champion',
	notation: 'H',
	symbols: {white: 'H', black: 'h'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getStepMoves(position, board, color, boardSize, CHAMPION_OFFSETS);
	},
};
