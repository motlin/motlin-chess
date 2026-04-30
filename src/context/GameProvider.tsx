import {useCallback, useEffect, useState} from 'react';
import type {GameSettings, GameState, PieceType, Position} from '../types.js';
import {completePromotion, createInitialGameState, selectSquare} from '../game/gameLogic.js';
import {importPgn} from '../game/pgnImport.js';
import {DEFAULT_BOARD_THEME, DEFAULT_PIECE_SET} from '../themes.js';
import {GameContext} from './GameContext.js';

interface GameHistory {
	readonly states: readonly GameState[];
	readonly currentIndex: number;
}

const DEFAULT_SETTINGS: GameSettings = {
	boardSize: 8,
	enabledPieces: new Set<string>(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']),
	pieceSet: DEFAULT_PIECE_SET,
	boardTheme: DEFAULT_BOARD_THEME,
	duckChess: false,
};

export function GameProvider({children}: {readonly children: React.ReactNode}): React.JSX.Element {
	const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
	const [history, setHistory] = useState<GameHistory>(() => {
		const initialState = createInitialGameState(settings);
		return {states: [initialState], currentIndex: 0};
	});

	const gameState = history.states[history.currentIndex]!;

	const onSquareClick = useCallback((position: Position) => {
		setHistory((previousHistory) => {
			const currentState = previousHistory.states[previousHistory.currentIndex]!;
			const newState = selectSquare(currentState, position);

			if (newState === currentState) {
				return previousHistory;
			}

			const isCommittedMove = newState.moveHistory.length > currentState.moveHistory.length;

			if (isCommittedMove) {
				const truncatedStates = previousHistory.states.slice(0, previousHistory.currentIndex + 1);
				return {
					states: [...truncatedStates, newState],
					currentIndex: previousHistory.currentIndex + 1,
				};
			}

			const updatedStates = previousHistory.states.map((state, index) =>
				index === previousHistory.currentIndex ? newState : state,
			);
			return {
				states: updatedStates,
				currentIndex: previousHistory.currentIndex,
			};
		});
	}, []);

	const onPromotionSelect = useCallback((pieceType: PieceType) => {
		setHistory((previousHistory) => {
			const currentState = previousHistory.states[previousHistory.currentIndex]!;
			const newState = completePromotion(currentState, pieceType);

			if (newState === currentState) {
				return previousHistory;
			}

			const truncatedStates = previousHistory.states.slice(0, previousHistory.currentIndex + 1);
			return {
				states: [...truncatedStates, newState],
				currentIndex: previousHistory.currentIndex + 1,
			};
		});
	}, []);

	const canUndo = gameState.pendingPromotion === null && history.currentIndex > 0;
	const canRedo = gameState.pendingPromotion === null && history.currentIndex < history.states.length - 1;

	const undo = useCallback(() => {
		setHistory((previousHistory) => {
			const currentState = previousHistory.states[previousHistory.currentIndex]!;
			if (currentState.pendingPromotion !== null || previousHistory.currentIndex <= 0) {
				return previousHistory;
			}

			const targetState = previousHistory.states[previousHistory.currentIndex - 1]!;
			const clearedState: GameState = {
				...targetState,
				selectedPosition: null,
				validMoves: [],
			};

			const updatedStates = previousHistory.states.map((state, index) =>
				index === previousHistory.currentIndex - 1 ? clearedState : state,
			);
			return {
				states: updatedStates,
				currentIndex: previousHistory.currentIndex - 1,
			};
		});
	}, []);

	const redo = useCallback(() => {
		setHistory((previousHistory) => {
			const currentState = previousHistory.states[previousHistory.currentIndex]!;
			if (
				currentState.pendingPromotion !== null ||
				previousHistory.currentIndex >= previousHistory.states.length - 1
			) {
				return previousHistory;
			}

			return {
				states: previousHistory.states,
				currentIndex: previousHistory.currentIndex + 1,
			};
		});
	}, []);

	const updateSettings = useCallback((update: Partial<GameSettings>) => {
		setSettings((prev) => {
			const next = {...prev, ...update};
			if (update.boardSize !== undefined || update.enabledPieces !== undefined) {
				const newInitialState = createInitialGameState(next);
				setHistory({states: [newInitialState], currentIndex: 0});
			}
			return next;
		});
	}, []);

	const resetGame = useCallback(() => {
		const newInitialState = createInitialGameState(settings);
		setHistory({states: [newInitialState], currentIndex: 0});
	}, [settings]);

	const importGame = useCallback(
		(pgn: string) => {
			const importedState = importPgn(pgn, settings);
			setHistory({states: [importedState], currentIndex: 0});
		},
		[settings],
	);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent): void {
			const modifierKey = event.metaKey || event.ctrlKey;
			if (!modifierKey) {
				return;
			}

			if (event.key === 'z' && !event.shiftKey) {
				event.preventDefault();
				undo();
			} else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
				event.preventDefault();
				redo();
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [undo, redo]);

	return (
		<GameContext
			value={{
				gameState,
				settings,
				onSquareClick,
				onPromotionSelect,
				updateSettings,
				resetGame,
				importGame,
				undo,
				redo,
				canUndo,
				canRedo,
			}}
		>
			{children}
		</GameContext>
	);
}
