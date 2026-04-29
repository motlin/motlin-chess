import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves} from '../moveHelpers.js';

const WIZARD_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-1, -1],
	[-1, 1],
	[1, -1],
	[1, 1],
	[-3, -1],
	[-3, 1],
	[-1, -3],
	[-1, 3],
	[1, -3],
	[1, 3],
	[3, -1],
	[3, 1],
];

export const wizardDefinition: PieceDefinition = {
	name: 'Wizard',
	notation: 'W',
	symbols: {white: 'W', black: 'w'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getStepMoves(position, board, color, boardSize, WIZARD_OFFSETS);
	},
};
