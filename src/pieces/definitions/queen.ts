import type {PieceDefinition} from '../PieceDefinition.js';
import {ALL_DIRECTIONS, getSlidingMoves} from '../moveHelpers.js';

export const queenDefinition: PieceDefinition = {
	name: 'Queen',
	symbols: {white: '♕', black: '♛'},
	isStandard: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getSlidingMoves(position, board, color, boardSize, ALL_DIRECTIONS);
	},
};
