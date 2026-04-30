import type {Move, Position, TurnPhase} from '../types.js';
import {Board as BoardType} from '../types.js';
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
	readonly duckPosition: Position | null;
	readonly turnPhase: TurnPhase;
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
	duckPosition,
	turnPhase,
	onSquareClick,
}: BoardProps): React.JSX.Element {
	const validMoveSet = new Set(validMoves.map((m) => `${m.to.row},${m.to.col}`));
	const captureMoveSet = new Set(
		validMoves.filter((m) => m.captured !== null || m.isEnPassant).map((m) => `${m.to.row},${m.to.col}`),
	);
	const lastMoveSet = new Set(
		lastMove !== null ? [`${lastMove.from.row},${lastMove.from.col}`, `${lastMove.to.row},${lastMove.to.col}`] : [],
	);

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
						const piece = board.get(row, col);
						const key = `${row},${col}`;
						const isLight = (row + col) % 2 === 0;
						const isSelected =
							selectedPosition !== null && selectedPosition.row === row && selectedPosition.col === col;
						const isValidMove = validMoveSet.has(key);
						const isCapture = captureMoveSet.has(key);
						const isLastMove = lastMoveSet.has(key);
						const isDuck = duckPosition !== null && duckPosition.row === row && duckPosition.col === col;
						const isDuckTarget = turnPhase === 'placeDuck' && piece === null && !isDuck;

						const rankLabel = col === 0 ? String(boardSize - row) : null;
						const fileLabel = row === boardSize - 1 ? String.fromCharCode(97 + col) : null;

						return (
							<Square
								key={key}
								piece={piece}
								isLight={isLight}
								isSelected={isSelected}
								isValidMove={isValidMove || isDuckTarget}
								isCapture={isCapture}
								isLastMove={isLastMove}
								isDuck={isDuck}
								pieceSet={pieceSet}
								rankLabel={rankLabel}
								fileLabel={fileLabel}
								onClick={() => onSquareClick({row, col})}
							/>
						);
					}),
				)}
			</div>
		</div>
	);
}
