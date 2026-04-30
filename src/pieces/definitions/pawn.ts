import type {Color, Position} from '../../types.js';
import {Board} from '../../types.js';
import type {PieceDefinition} from '../PieceDefinition.js';
import {isInBounds} from '../moveHelpers.js';

function isDuckAt(duckPosition: Position | null | undefined, row: number, col: number): boolean {
	return duckPosition != null && duckPosition.row === row && duckPosition.col === col;
}

function getPawnMoves(
	position: Position,
	board: Board,
	color: Color,
	boardSize: number,
	enPassantTarget: Position | null,
	duckPosition?: Position | null,
): Position[] {
	const moves: Position[] = [];
	const direction = color === 'white' ? -1 : 1;
	const startRow = color === 'white' ? boardSize - 2 : 1;

	const oneAhead = position.row + direction;
	if (isInBounds(oneAhead, position.col, boardSize)) {
		const targetSquare = board.get(oneAhead, position.col);
		if (targetSquare === null && !isDuckAt(duckPosition, oneAhead, position.col)) {
			moves.push({row: oneAhead, col: position.col});

			if (position.row === startRow) {
				const twoAhead = position.row + direction * 2;
				if (isInBounds(twoAhead, position.col, boardSize)) {
					const twoAheadSquare = board.get(twoAhead, position.col);
					if (twoAheadSquare === null && !isDuckAt(duckPosition, twoAhead, position.col)) {
						moves.push({row: twoAhead, col: position.col});
					}
				}
			}
		}
	}

	for (const dCol of [-1, 1]) {
		const captureCol = position.col + dCol;
		if (!isInBounds(oneAhead, captureCol, boardSize)) {
			continue;
		}
		if (isDuckAt(duckPosition, oneAhead, captureCol)) continue;
		const captureTarget = board.get(oneAhead, captureCol);
		if (captureTarget !== null && captureTarget.color !== color) {
			moves.push({row: oneAhead, col: captureCol});
		}

		if (enPassantTarget !== null && enPassantTarget.row === oneAhead && enPassantTarget.col === captureCol) {
			moves.push({row: oneAhead, col: captureCol});
		}
	}

	return moves;
}

export const pawnDefinition: PieceDefinition = {
	name: 'Pawn',
	symbols: {white: '♙', black: '♟'},
	isStandard: true,
	count: 2,
	royal: false,
	jumper: false,
	toggleable: false,
	getValidMoves: getPawnMoves,
};
