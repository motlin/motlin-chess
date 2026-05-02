import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves} from '../moveHelpers.js';

const CAMEL_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-3, -1],
	[-3, 1],
	[-1, -3],
	[-1, 3],
	[1, -3],
	[1, 3],
	[3, -1],
	[3, 1],
];

export const camelDefinition: PieceDefinition = {
	name: 'Camel',
	notation: 'L',
	symbols: {white: 'L', black: 'l'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget, duckPosition) {
		return getStepMoves(position, board, color, boardSize, CAMEL_OFFSETS, duckPosition);
	},
};
