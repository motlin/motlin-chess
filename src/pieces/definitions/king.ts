import type {PieceDefinition} from '../PieceDefinition.js';
import {ALL_DIRECTIONS, getStepMoves} from '../moveHelpers.js';

const KING_OFFSETS = ALL_DIRECTIONS.map((d) => [d.dRow, d.dCol] as const);

export const kingDefinition: PieceDefinition = {
	name: 'King',
	notation: 'K',
	symbols: {white: '♔', black: '♚'},
	isStandard: true,
	count: 1,
	royal: true,
	jumper: false,
	toggleable: false,
	getValidMoves(position, board, color, boardSize, _enPassantTarget, duckPosition) {
		return getStepMoves(position, board, color, boardSize, KING_OFFSETS, duckPosition);
	},
};
