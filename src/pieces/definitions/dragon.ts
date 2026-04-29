import type {Board, Color, Position} from '../../types.js';
import type {PieceDefinition} from '../PieceDefinition.js';
import {getStepMoves, isInBounds} from '../moveHelpers.js';

const KNIGHT_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[-2, -1],
	[-2, 1],
	[-1, -2],
	[-1, 2],
	[1, -2],
	[1, 2],
	[2, -1],
	[2, 1],
];

function getDragonMoves(position: Position, board: Board, color: Color, boardSize: number): Position[] {
	const knightMoves = getStepMoves(position, board, color, boardSize, KNIGHT_OFFSETS);
	const direction = color === 'white' ? -1 : 1;

	for (const dCol of [-1, 1]) {
		const row = position.row + direction;
		const col = position.col + dCol;
		if (!isInBounds(row, col, boardSize)) {
			continue;
		}
		const target = board.get(row, col);
		if (target !== null && target.color !== color) {
			if (!knightMoves.some((m) => m.row === row && m.col === col)) {
				knightMoves.push({row, col});
			}
		}
	}

	return knightMoves;
}

export const dragonDefinition: PieceDefinition = {
	name: 'Dragon',
	notation: 'D',
	symbols: {white: 'D', black: 'd'},
	isStandard: false,
	count: 2,
	royal: false,
	jumper: true,
	toggleable: true,
	getValidMoves(position, board, color, boardSize, _enPassantTarget) {
		return getDragonMoves(position, board, color, boardSize);
	},
};
