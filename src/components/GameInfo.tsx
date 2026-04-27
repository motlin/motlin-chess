import type {Color, GameStatus} from '../types.js';
import './GameInfo.css';

interface GameInfoProps {
	readonly currentTurn: Color;
	readonly moveCount: number;
	readonly gameStatus: GameStatus;
}

function getStatusText(gameStatus: GameStatus, currentTurn: Color): string {
	switch (gameStatus) {
		case 'checkmate': {
			const winner = currentTurn === 'white' ? 'Black' : 'White';
			return `Checkmate! ${winner} wins!`;
		}
		case 'stalemate':
			return 'Stalemate! Draw.';
		case 'check':
			return `${currentTurn === 'white' ? 'White' : 'Black'} is in check!`;
		case 'playing':
			return `${currentTurn === 'white' ? 'White' : 'Black'} to move`;
	}
}

export function GameInfo({currentTurn, moveCount, gameStatus}: GameInfoProps): React.JSX.Element {
	return (
		<div className="game-info">
			<div className={`status status-${gameStatus}`}>{getStatusText(gameStatus, currentTurn)}</div>
			<div className="move-count">Moves: {moveCount}</div>
		</div>
	);
}
