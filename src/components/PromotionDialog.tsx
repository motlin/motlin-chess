import type {Color, PieceType} from '../types.js';
import {getPieceDefinition} from '../pieces/registry.js';
import './PromotionDialog.css';

interface PromotionDialogProps {
	readonly color: Color;
	readonly onSelect: (pieceType: PieceType) => void;
}

const PROMOTION_OPTIONS: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export function PromotionDialog({color, onSelect}: PromotionDialogProps): React.JSX.Element {
	return (
		<div className="promotion-overlay">
			<div className="promotion-dialog">
				<h3 className="promotion-title">Promote pawn to:</h3>
				<div className="promotion-options">
					{PROMOTION_OPTIONS.map((type) => {
						const def = getPieceDefinition(type);
						const symbol = def?.symbols[color] ?? '?';
						return (
							<button
								key={type}
								type="button"
								className="promotion-option"
								onClick={() => onSelect(type)}
								title={def?.name ?? type}
							>
								{symbol}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
