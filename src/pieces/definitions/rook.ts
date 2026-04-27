import type {PieceDefinition} from '../PieceDefinition.js';
import {CARDINAL_DIRECTIONS, getSlidingMoves} from '../moveHelpers.js';

export const rookDefinition: PieceDefinition = {
	name: 'Rook',
	symbols: {white: '♖', black: '♜'},
	isStandard: true,
	count: 2,
	royal: false,
	jumper: false,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getSlidingMoves(position, board, color, boardSize, CARDINAL_DIRECTIONS);
	},
};
