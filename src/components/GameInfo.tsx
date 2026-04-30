import type {Color, GameStatus, TurnPhase} from '../types.js';
import './GameInfo.css';

interface GameInfoProps {
	readonly currentTurn: Color;
	readonly moveCount: number;
	readonly gameStatus: GameStatus;
	readonly turnPhase: TurnPhase;
	readonly duckChess: boolean;
}

function getStatusText(gameStatus: GameStatus, currentTurn: Color, turnPhase: TurnPhase, duckChess: boolean): string {
	switch (gameStatus) {
		case 'kingCaptured': {
			const winner = currentTurn === 'white' ? 'White' : 'Black';
			return `King captured! ${winner} wins!`;
		}
		case 'fowled': {
			const winner = currentTurn === 'white' ? 'White' : 'Black';
			return `Fowled! ${winner} wins!`;
		}
		case 'checkmate': {
			const winner = currentTurn === 'white' ? 'Black' : 'White';
			return `Checkmate! ${winner} wins!`;
		}
		case 'stalemate':
			return 'Stalemate! Draw.';
		case 'check':
			return `${currentTurn === 'white' ? 'White' : 'Black'} is in check!`;
		case 'playing': {
			const player = currentTurn === 'white' ? 'White' : 'Black';
			if (duckChess && turnPhase === 'placeDuck') {
				return `${player}: place the duck`;
			}
			return `${player} to move`;
		}
	}
}

export function GameInfo({currentTurn, moveCount, gameStatus, turnPhase, duckChess}: GameInfoProps): React.JSX.Element {
	return (
		<div className="game-info">
			<div className={`status status-${gameStatus}`}>
				{getStatusText(gameStatus, currentTurn, turnPhase, duckChess)}
			</div>
			<div className="move-count">Moves: {moveCount}</div>
		</div>
	);
}
