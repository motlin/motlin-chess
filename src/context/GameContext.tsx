import {createContext, useCallback, useContext, useState} from 'react';
import type {GameSettings, GameState, PieceType, Position} from '../types.js';
import {completePromotion, createInitialGameState, selectSquare} from '../game/gameLogic.js';
import {DEFAULT_BOARD_THEME, DEFAULT_PIECE_SET} from '../themes.js';

interface GameContextValue {
	readonly gameState: GameState;
	readonly settings: GameSettings;
	readonly onSquareClick: (position: Position) => void;
	readonly onPromotionSelect: (pieceType: PieceType) => void;
	readonly updateSettings: (update: Partial<GameSettings>) => void;
	readonly resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const DEFAULT_SETTINGS: GameSettings = {
	boardSize: 8,
	enabledPieces: new Set<string>(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']),
	pieceSet: DEFAULT_PIECE_SET,
	boardTheme: DEFAULT_BOARD_THEME,
};

export function GameProvider({children}: {readonly children: React.ReactNode}): React.JSX.Element {
	const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
	const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(settings));

	const onSquareClick = useCallback((position: Position) => {
		setGameState((prev) => selectSquare(prev, position));
	}, []);

	const onPromotionSelect = useCallback((pieceType: PieceType) => {
		setGameState((prev) => completePromotion(prev, pieceType));
	}, []);

	const updateSettings = useCallback((update: Partial<GameSettings>) => {
		setSettings((prev) => {
			const next = {...prev, ...update};
			if (update.boardSize !== undefined || update.enabledPieces !== undefined) {
				setGameState(createInitialGameState(next));
			}
			return next;
		});
	}, []);

	const resetGame = useCallback(() => {
		setGameState(createInitialGameState(settings));
	}, [settings]);

	return (
		<GameContext value={{gameState, settings, onSquareClick, onPromotionSelect, updateSettings, resetGame}}>
			{children}
		</GameContext>
	);
}

export function useGame(): GameContextValue {
	const context = useContext(GameContext);
	if (context === null) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
}
