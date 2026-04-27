import type {PieceDefinition} from '../PieceDefinition.js';
import {DIAGONAL_DIRECTIONS, getSlidingMoves} from '../moveHelpers.js';

export const bishopDefinition: PieceDefinition = {
	name: 'Bishop',
	symbols: {white: '♗', black: '♝'},
	isStandard: true,
	count: 2,
	royal: false,
	jumper: false,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getSlidingMoves(position, board, color, boardSize, DIAGONAL_DIRECTIONS);
	},
};
