import type {Piece} from '../types.js';
import {getPieceImagePath} from '../themes.js';
import './PieceDisplay.css';

interface PieceDisplayProps {
	readonly piece: Piece;
	readonly pieceSet: string;
}

export function PieceDisplay({piece, pieceSet}: PieceDisplayProps): React.JSX.Element {
	const src = getPieceImagePath(pieceSet, piece.color, piece.type);
	return <img className="piece" src={src} alt={`${piece.color} ${piece.type}`} draggable={false} />;
}
