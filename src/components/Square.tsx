import type {Piece} from '../types.js';
import {PieceDisplay} from './PieceDisplay.js';
import './Square.css';

interface SquareProps {
	readonly piece: Piece | null;
	readonly isLight: boolean;
	readonly isSelected: boolean;
	readonly isValidMove: boolean;
	readonly isCapture: boolean;
	readonly isLastMove: boolean;
	readonly isDuck: boolean;
	readonly pieceSet: string;
	readonly rankLabel: string | null;
	readonly fileLabel: string | null;
	readonly onClick: () => void;
}

export function Square({
	piece,
	isLight,
	isSelected,
	isValidMove,
	isCapture,
	isLastMove,
	isDuck,
	pieceSet,
	rankLabel,
	fileLabel,
	onClick,
}: SquareProps): React.JSX.Element {
	const classes = [
		'square',
		isLight ? 'square-light' : 'square-dark',
		isSelected ? 'square-selected' : '',
		isValidMove ? 'square-valid-move' : '',
		isCapture ? 'square-capture' : '',
		isLastMove ? 'square-last-move' : '',
		isDuck ? 'square-duck' : '',
	]
		.filter(Boolean)
		.join(' ');

	const coordColor = isLight ? 'coord-dark' : 'coord-light';

	return (
		<button type="button" className={classes} onClick={onClick}>
			{rankLabel !== null && <span className={`coord coord-rank ${coordColor}`}>{rankLabel}</span>}
			{fileLabel !== null && <span className={`coord coord-file ${coordColor}`}>{fileLabel}</span>}
			{isDuck && <img src="/pieces/duck.svg" alt="Duck" className="piece" draggable={false} />}
			{piece !== null && !isDuck && <PieceDisplay piece={piece} pieceSet={pieceSet} />}
			{isValidMove && piece === null && !isDuck && <span className="move-indicator" />}
		</button>
	);
}
