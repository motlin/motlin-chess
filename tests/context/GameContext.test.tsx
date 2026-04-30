// @vitest-environment jsdom

import {describe, expect, test} from 'vite-plus/test';
import {act, renderHook} from '@testing-library/react';
import type {GameContextValue} from '../../src/context/GameContext.js';
import {GameProvider} from '../../src/context/GameProvider.js';
import {useGame} from '../../src/context/useGame.js';

function renderGameHook(): {readonly current: GameContextValue} {
	const {result} = renderHook(() => useGame(), {
		wrapper: GameProvider,
	});
	return result;
}

function makeMove(
	result: {readonly current: GameContextValue},
	fromRow: number,
	fromCol: number,
	toRow: number,
	toCol: number,
): void {
	act(() => {
		result.current.onSquareClick({row: fromRow, col: fromCol});
	});
	act(() => {
		result.current.onSquareClick({row: toRow, col: toCol});
	});
}

function fireKeyDown(key: string, options: {ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean} = {}): void {
	const event = new KeyboardEvent('keydown', {
		key,
		ctrlKey: options.ctrlKey ?? false,
		metaKey: options.metaKey ?? false,
		shiftKey: options.shiftKey ?? false,
		bubbles: true,
	});
	window.dispatchEvent(event);
}

describe('undo/redo', () => {
	test('initial state: canUndo and canRedo are both false', () => {
		const result = renderGameHook();

		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(false);
	});

	test('after one move: canUndo is true', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		expect(result.current.canUndo).toBe(true);
		expect(result.current.canRedo).toBe(false);
	});

	test('undo reverts board, turn, and moveHistory', () => {
		const result = renderGameHook();

		const boardBefore = result.current.gameState.board;
		const turnBefore = result.current.gameState.currentTurn;
		const moveHistoryLengthBefore = result.current.gameState.moveHistory.length;

		makeMove(result, 6, 4, 4, 4);

		expect(result.current.gameState.currentTurn).toBe('black');
		expect(result.current.gameState.moveHistory.length).toBe(1);

		act(() => {
			result.current.undo();
		});

		expect(result.current.gameState.currentTurn).toBe(turnBefore);
		expect(result.current.gameState.moveHistory.length).toBe(moveHistoryLengthBefore);
		expect(result.current.gameState.board.get(6, 4)).toStrictEqual(boardBefore.get(6, 4));
		expect(result.current.gameState.board.get(4, 4)).toStrictEqual(boardBefore.get(4, 4));
	});

	test('after undo: canRedo is true', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		act(() => {
			result.current.undo();
		});

		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(true);
	});

	test('redo restores the undone move', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		const boardAfterMove = result.current.gameState.board;
		const turnAfterMove = result.current.gameState.currentTurn;

		act(() => {
			result.current.undo();
		});
		act(() => {
			result.current.redo();
		});

		expect(result.current.gameState.currentTurn).toBe(turnAfterMove);
		expect(result.current.gameState.moveHistory.length).toBe(1);
		expect(result.current.gameState.board.get(4, 4)).toStrictEqual(boardAfterMove.get(4, 4));
		expect(result.current.gameState.board.get(6, 4)).toStrictEqual(boardAfterMove.get(6, 4));
	});

	test('new move after undo clears redo stack', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);
		makeMove(result, 1, 4, 3, 4);

		act(() => {
			result.current.undo();
		});

		expect(result.current.canRedo).toBe(true);

		makeMove(result, 1, 3, 3, 3);

		expect(result.current.canRedo).toBe(false);
		expect(result.current.gameState.moveHistory.length).toBe(2);
	});

	test('multiple undo/redo navigation: 3 moves, undo twice, redo once', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);
		makeMove(result, 1, 4, 3, 4);
		makeMove(result, 6, 3, 4, 3);

		expect(result.current.gameState.moveHistory.length).toBe(3);

		act(() => {
			result.current.undo();
		});
		act(() => {
			result.current.undo();
		});

		expect(result.current.gameState.moveHistory.length).toBe(1);
		expect(result.current.gameState.currentTurn).toBe('black');

		act(() => {
			result.current.redo();
		});

		expect(result.current.gameState.moveHistory.length).toBe(2);
		expect(result.current.gameState.currentTurn).toBe('white');
	});

	test('boundary no-op: undo at start is safe', () => {
		const result = renderGameHook();

		const stateBefore = result.current.gameState;

		act(() => {
			result.current.undo();
		});

		expect(result.current.gameState.currentTurn).toBe(stateBefore.currentTurn);
		expect(result.current.gameState.moveHistory.length).toBe(stateBefore.moveHistory.length);
	});

	test('boundary no-op: redo at end is safe', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		const stateBefore = result.current.gameState;

		act(() => {
			result.current.redo();
		});

		expect(result.current.gameState.currentTurn).toBe(stateBefore.currentTurn);
		expect(result.current.gameState.moveHistory.length).toBe(stateBefore.moveHistory.length);
	});

	test('reset clears history', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);
		makeMove(result, 1, 4, 3, 4);

		expect(result.current.canUndo).toBe(true);

		act(() => {
			result.current.resetGame();
		});

		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(false);
		expect(result.current.gameState.moveHistory.length).toBe(0);
		expect(result.current.gameState.currentTurn).toBe('white');
	});

	test('selection state cleared on undo', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		act(() => {
			result.current.onSquareClick({row: 1, col: 4});
		});

		expect(result.current.gameState.selectedPosition).not.toBeNull();

		act(() => {
			result.current.undo();
		});

		expect(result.current.gameState.selectedPosition).toBeNull();
	});

	test('keyboard shortcut: Ctrl+Z triggers undo', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		expect(result.current.canUndo).toBe(true);

		act(() => {
			fireKeyDown('z', {ctrlKey: true});
		});

		expect(result.current.gameState.moveHistory.length).toBe(0);
		expect(result.current.canUndo).toBe(false);
	});

	test('keyboard shortcut: Ctrl+Shift+Z triggers redo', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		act(() => {
			result.current.undo();
		});

		expect(result.current.canRedo).toBe(true);

		act(() => {
			fireKeyDown('z', {ctrlKey: true, shiftKey: true});
		});

		expect(result.current.gameState.moveHistory.length).toBe(1);
		expect(result.current.canRedo).toBe(false);
	});

	test('keyboard shortcut: Ctrl+Y triggers redo', () => {
		const result = renderGameHook();

		makeMove(result, 6, 4, 4, 4);

		act(() => {
			result.current.undo();
		});

		expect(result.current.canRedo).toBe(true);

		act(() => {
			fireKeyDown('y', {ctrlKey: true});
		});

		expect(result.current.gameState.moveHistory.length).toBe(1);
		expect(result.current.canRedo).toBe(false);
	});
});
