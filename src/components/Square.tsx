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

	return (
		<button type="button" className={classes} onClick={onClick}>
			{isDuck && <img src="/pieces/duck.svg" alt="Duck" className="piece" draggable={false} />}
			{piece !== null && !isDuck && <PieceDisplay piece={piece} pieceSet={pieceSet} />}
			{isValidMove && piece === null && !isDuck && <span className="move-indicator" />}
		</button>
	);
}
