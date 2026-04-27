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
	readonly onClick: () => void;
}

export function Square({
	piece,
	isLight,
	isSelected,
	isValidMove,
	isCapture,
	isLastMove,
	onClick,
}: SquareProps): React.JSX.Element {
	const classes = [
		'square',
		isLight ? 'square-light' : 'square-dark',
		isSelected ? 'square-selected' : '',
		isValidMove ? 'square-valid-move' : '',
		isCapture ? 'square-capture' : '',
		isLastMove ? 'square-last-move' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<button type="button" className={classes} onClick={onClick}>
			{piece !== null && <PieceDisplay piece={piece} />}
			{isValidMove && piece === null && <span className="move-indicator" />}
		</button>
	);
}
