import type {Board, Color, Position} from '../types.js';

export interface PieceDefinition {
	readonly name: string;
	readonly symbols: {readonly white: string; readonly black: string};
	readonly isStandard: boolean;
	getValidMoves(
		position: Position,
		board: Board,
		color: Color,
		boardSize: number,
		enPassantTarget: Position | null,
	): Position[];
}
