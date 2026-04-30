import {useGame} from '../context/useGame.js';
import {getBoardTheme} from '../themes.js';
import {Board} from './Board.js';
import {GameInfo} from './GameInfo.js';
import {PromotionDialog} from './PromotionDialog.js';
import {SettingsPanel} from './SettingsPanel.js';
import './Game.css';

export function Game(): React.JSX.Element {
	const {
		gameState,
		settings,
		onSquareClick,
		onPromotionSelect,
		updateSettings,
		resetGame,
		undo,
		redo,
		canUndo,
		canRedo,
	} = useGame();
	const boardTheme = getBoardTheme(settings.boardTheme);

	return (
		<div className="game">
			<div className="game-main">
				<GameInfo
					currentTurn={gameState.currentTurn}
					moveCount={gameState.moveHistory.length}
					gameStatus={gameState.gameStatus}
					turnPhase={gameState.turnPhase}
					duckChess={settings.duckChess}
					canUndo={canUndo}
					canRedo={canRedo}
					onUndo={undo}
					onRedo={redo}
				/>
				<Board
					board={gameState.board}
					boardSize={gameState.boardSize}
					selectedPosition={gameState.selectedPosition}
					validMoves={gameState.validMoves}
					lastMove={gameState.moveHistory[gameState.moveHistory.length - 1] ?? null}
					pieceSet={settings.pieceSet}
					boardTheme={boardTheme}
					duckPosition={gameState.duckPosition}
					turnPhase={gameState.turnPhase}
					onSquareClick={onSquareClick}
				/>
			</div>
			<SettingsPanel settings={settings} onSettingsChange={updateSettings} onReset={resetGame} />
			{gameState.pendingPromotion !== null && (
				<PromotionDialog
					color={gameState.currentTurn}
					pieceSet={settings.pieceSet}
					onSelect={onPromotionSelect}
				/>
			)}
		</div>
	);
}
