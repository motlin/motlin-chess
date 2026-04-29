import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves} from '../moveHelpers.js';

const ALFIL_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-2, -2],
	[-2, 2],
	[2, -2],
	[2, 2],
];

export const elephantDefinition: PieceDefinition = {
	name: 'Elephant',
	notation: 'E',
	symbols: {white: 'E', black: 'e'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getStepMoves(position, board, color, boardSize, ALFIL_OFFSETS);
	},
};
