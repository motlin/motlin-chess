import type {Board, Color, Position} from '../types.js';

export interface PieceDefinition {
	readonly name: string;
	readonly notation: string;
	readonly symbols: {readonly white: string; readonly black: string};
	readonly isStandard: boolean;
	readonly count: 1 | 2;
	readonly royal: boolean;
	readonly jumper: boolean;
	readonly toggleable: boolean;
	getValidMoves(
		position: Position,
		board: Board,
		color: Color,
		boardSize: number,
		enPassantTarget: Position | null,
		duckPosition?: Position | null,
	): Position[];
}
