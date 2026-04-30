import {createContext} from 'react';
import type {GameSettings, GameState, PieceType, Position} from '../types.js';

export interface GameContextValue {
	readonly gameState: GameState;
	readonly settings: GameSettings;
	readonly onSquareClick: (position: Position) => void;
	readonly onPromotionSelect: (pieceType: PieceType) => void;
	readonly updateSettings: (update: Partial<GameSettings>) => void;
	readonly resetGame: () => void;
	readonly importGame: (pgn: string) => void;
	readonly undo: () => void;
	readonly redo: () => void;
	readonly canUndo: boolean;
	readonly canRedo: boolean;
}

export const GameContext = createContext<GameContextValue | null>(null);
