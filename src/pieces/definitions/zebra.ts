import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves} from '../moveHelpers.js';

const ZEBRA_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-3, -2],
	[-3, 2],
	[-2, -3],
	[-2, 3],
	[2, -3],
	[2, 3],
	[3, -2],
	[3, 2],
];

export const zebraDefinition: PieceDefinition = {
	name: 'Zebra',
	notation: 'Z',
	symbols: {white: 'Z', black: 'z'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getStepMoves(position, board, color, boardSize, ZEBRA_OFFSETS);
	},
};
