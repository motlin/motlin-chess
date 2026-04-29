import type {Board, Color, Position} from '../types.js';

export interface Direction {
	readonly dRow: number;
	readonly dCol: number;
}

export const CARDINAL_DIRECTIONS: readonly Direction[] = [
	{dRow: -1, dCol: 0},
	{dRow: 1, dCol: 0},
	{dRow: 0, dCol: -1},
	{dRow: 0, dCol: 1},
];

export const DIAGONAL_DIRECTIONS: readonly Direction[] = [
	{dRow: -1, dCol: -1},
	{dRow: -1, dCol: 1},
	{dRow: 1, dCol: -1},
	{dRow: 1, dCol: 1},
];

export const ALL_DIRECTIONS: readonly Direction[] = [...CARDINAL_DIRECTIONS, ...DIAGONAL_DIRECTIONS];

export function isInBounds(row: number, col: number, boardSize: number): boolean {
	return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

export function getSlidingMoves(
	position: Position,
	board: Board,
	color: Color,
	boardSize: number,
	directions: readonly Direction[],
): Position[] {
	const moves: Position[] = [];
	for (const {dRow, dCol} of directions) {
		let row = position.row + dRow;
		let col = position.col + dCol;
		while (isInBounds(row, col, boardSize)) {
			const target = board[row]?.[col];
			if (target === undefined) {
				break;
			}
			if (target === null) {
				moves.push({row, col});
			} else {
				if (target.color !== color) {
					moves.push({row, col});
				}
				break;
			}
			row += dRow;
			col += dCol;
		}
	}
	return moves;
}

export function getStepMoves(
	position: Position,
	board: Board,
	color: Color,
	boardSize: number,
	offsets: ReadonlyArray<readonly [number, number]>,
): Position[] {
	const moves: Position[] = [];
	for (const [dRow, dCol] of offsets) {
		const row = position.row + dRow;
		const col = position.col + dCol;
		if (!isInBounds(row, col, boardSize)) {
			continue;
		}
		const target = board[row]?.[col];
		if (target === undefined) {
			continue;
		}
		if (target === null || target.color !== color) {
			moves.push({row, col});
		}
	}
	return moves;
}
