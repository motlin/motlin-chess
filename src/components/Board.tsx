import type {Board as BoardType, Move, Position} from '../types.js';
import {Square} from './Square.js';
import './Board.css';

interface BoardProps {
	readonly board: BoardType;
	readonly boardSize: number;
	readonly selectedPosition: Position | null;
	readonly validMoves: readonly Move[];
	readonly lastMove: Move | null;
	readonly onSquareClick: (position: Position) => void;
}

export function Board({
	board,
	boardSize,
	selectedPosition,
	validMoves,
	lastMove,
	onSquareClick,
}: BoardProps): React.JSX.Element {
	const validMoveSet = new Set(validMoves.map((m) => `${m.to.row},${m.to.col}`));
	const captureMoveSet = new Set(
		validMoves.filter((m) => m.captured !== null || m.isEnPassant).map((m) => `${m.to.row},${m.to.col}`),
	);
	const lastMoveSet = new Set(
		lastMove !== null ? [`${lastMove.from.row},${lastMove.from.col}`, `${lastMove.to.row},${lastMove.to.col}`] : [],
	);

	const fileLabels: string[] = [];
	for (let col = 0; col < boardSize; col++) {
		fileLabels.push(String.fromCharCode(97 + col));
	}

	return (
		<div className="board-container">
			<div
				className="board"
				style={
					{
						gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
						'--board-size': boardSize,
					} as React.CSSProperties
				}
			>
				{Array.from({length: boardSize}, (_, row) =>
					Array.from({length: boardSize}, (_, col) => {
						const piece = board[row]?.[col] ?? null;
						const key = `${row},${col}`;
						const isLight = (row + col) % 2 === 0;
						const isSelected =
							selectedPosition !== null && selectedPosition.row === row && selectedPosition.col === col;
						const isValidMove = validMoveSet.has(key);
						const isCapture = captureMoveSet.has(key);
						const isLastMove = lastMoveSet.has(key);

						return (
							<Square
								key={key}
								piece={piece}
								isLight={isLight}
								isSelected={isSelected}
								isValidMove={isValidMove}
								isCapture={isCapture}
								isLastMove={isLastMove}
								onClick={() => onSquareClick({row, col})}
							/>
						);
					}),
				)}
			</div>
			<div className="file-labels" style={{gridTemplateColumns: `repeat(${boardSize}, 1fr)`}}>
				{fileLabels.map((label) => (
					<span key={label} className="file-label">
						{label}
					</span>
				))}
			</div>
		</div>
	);
}
