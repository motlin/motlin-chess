import type {PieceDefinition} from '../PieceDefinition.js';
import {ALL_DIRECTIONS, getSlidingMoves} from '../moveHelpers.js';

export const queenDefinition: PieceDefinition = {
	name: 'Queen',
	notation: 'Q',
	symbols: {white: '♕', black: '♛'},
	isStandard: true,
	count: 1,
	royal: false,
	jumper: false,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget, duckPosition) {
		return getSlidingMoves(position, board, color, boardSize, ALL_DIRECTIONS, duckPosition);
	},
};
