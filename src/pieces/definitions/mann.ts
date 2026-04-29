import type {PieceDefinition} from '../PieceDefinition.js';
import {ALL_DIRECTIONS, getStepMoves} from '../moveHelpers.js';

const KING_OFFSETS: ReadonlyArray<readonly [number, number]> = ALL_DIRECTIONS.map((d) => [d.dRow, d.dCol] as const);

export const mannDefinition: PieceDefinition = {
	name: 'Mann',
	notation: 'M',
	symbols: {white: 'X', black: 'x'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: false,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getStepMoves(position, board, color, boardSize, KING_OFFSETS);
	},
};
