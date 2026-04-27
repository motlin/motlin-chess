import type {Piece} from '../types.js';
import {getPieceDefinition} from '../pieces/registry.js';
import './PieceDisplay.css';

interface PieceDisplayProps {
	readonly piece: Piece;
}

export function PieceDisplay({piece}: PieceDisplayProps): React.JSX.Element {
	const definition = getPieceDefinition(piece.type);
	const symbol = definition?.symbols[piece.color] ?? '?';

	return <span className={`piece piece-${piece.color}`}>{symbol}</span>;
}
