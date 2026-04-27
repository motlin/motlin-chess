import type {Board as BoardType, Move, Position} from '../types.js';
import type {BoardTheme} from '../themes.js';
import {Square} from './Square.js';
import './Board.css';

interface BoardProps {
	readonly board: BoardType;
	readonly boardSize: number;
	readonly selectedPosition: Position | null;
	readonly validMoves: readonly Move[];
	readonly lastMove: Move | null;
	readonly pieceSet: string;
	readonly boardTheme: BoardTheme;
	readonly onSquareClick: (position: Position) => void;
}

export function Board({
	board,
	boardSize,
	selectedPosition,
	validMoves,
	lastMove,
	pieceSet,
	boardTheme,
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

	const maxSquarePx = 72;
	const maxBoardPx = boardSize * maxSquarePx;
	const dimension = `min(calc(100vw - 340px), calc(100vh - 220px), ${maxBoardPx}px)`;

	const themeVars = {
		'--board-light': boardTheme.lightSquare,
		'--board-dark': boardTheme.darkSquare,
		'--board-light-texture': boardTheme.textured && boardTheme.lightTexture ? boardTheme.lightTexture : 'none',
		'--board-dark-texture': boardTheme.textured && boardTheme.darkTexture ? boardTheme.darkTexture : 'none',
		'--board-dimension': dimension,
		gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
	} as React.CSSProperties;

	return (
		<div className="board-container">
			<div className="board" style={themeVars}>
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
								pieceSet={pieceSet}
								onClick={() => onSquareClick({row, col})}
							/>
						);
					}),
				)}
			</div>
			<div className="file-labels" style={{gridTemplateColumns: `repeat(${boardSize}, 1fr)`, width: dimension}}>
				{fileLabels.map((label) => (
					<span key={label} className="file-label">
						{label}
					</span>
				))}
			</div>
		</div>
	);
}
